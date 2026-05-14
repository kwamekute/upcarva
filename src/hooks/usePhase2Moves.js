import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"

const todayKey = () => new Date().toISOString().split("T")[0]

const offsetDate = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split("T")[0]
}

const daysInCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const days = new Date(year, month + 1, 0).getDate()

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(year, month, index + 1)
    return date.toISOString().split("T")[0]
  })
}

const currentMonthStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
}

export function usePhase2Moves({ userId, enabled }) {
  const [loading, setLoading] = useState(true)
  const [userMoves, setUserMoves] = useState([])
  const [attempts, setAttempts] = useState([])
  const [swapOffset, setSwapOffset] = useState(0)
  const [dismissedFeedback, setDismissedFeedback] = useState(false)
  const [forceFeedbackOpen, setForceFeedbackOpen] = useState(false)
  const today = todayKey()
  const yesterday = offsetDate(-1)
  const dismissKey = `upcarva_phase2_feedback_dismissed_${userId || "demo"}_${yesterday}`

  const fetchMoves = useCallback(async () => {
    if (!enabled || !userId) {
      setLoading(false)
      return
    }

    setLoading(true)

    const [{ data: movesData, error: movesError }, { data: attemptsData, error: attemptsError }] = await Promise.all([
      supabase
        .from("user_moves")
        .select("id,user_id,status,priority_score,assigned_at,updated_at,title,subtext")
        .eq("user_id", userId)
        .in("status", ["available", "active"])
        .order("priority_score", { ascending: false })
        .order("assigned_at", { ascending: true }),
      supabase
        .from("move_attempts")
        .select("id,user_move_id,user_id,cycle_date,accepted_at,completion_status,feedback_at,created_at,updated_at,user_move:user_moves(id,title,subtext)")
        .eq("user_id", userId)
        .gte("cycle_date", currentMonthStart())
        .order("cycle_date", { ascending: false })
    ])

    if (movesError) console.error("Could not load user moves:", movesError)
    if (attemptsError) console.error("Could not load move attempts:", attemptsError)

    setUserMoves(movesData || [])
    setAttempts(attemptsData || [])
    setLoading(false)
  }, [enabled, userId])

  useEffect(() => {
    fetchMoves()
  }, [fetchMoves])

  const moveById = useMemo(
    () => new Map((userMoves || []).map((move) => [move.id, move])),
    [userMoves]
  )

  const phase2Day = useMemo(() => {
    const dates = new Set(attempts.map((attempt) => attempt.cycle_date))
    return Math.max(dates.size + (dates.has(today) ? 0 : 1), 1)
  }, [attempts, today])

  const selectedMove = useMemo(() => {
    const orderedMoves = userMoves.length ? userMoves : []
    const activeMove = orderedMoves.find((move) => move.status === "active")
    if (activeMove) {
      return {
        ...activeMove,
        title: activeMove.title || "Today's move",
        subtext: activeMove.subtext || "One small win today."
      }
    }

    const availableMoves = orderedMoves.filter((move) => move.status === "available")

    if (availableMoves.length > 0) {
      const move = availableMoves[(phase2Day - 1 + swapOffset) % availableMoves.length]
      return {
        ...move,
        title: move.title || "Today's move",
        subtext: move.subtext || "One small win today."
      }
    }

    return null
  }, [phase2Day, swapOffset, userMoves])

  const enrichAttempt = useCallback((attempt) => {
    if (!attempt) return null
    const linkedMove = moveById.get(attempt.user_move_id)
    const joinedMove = attempt.user_move
    return {
      ...attempt,
      title: joinedMove?.title || linkedMove?.title || attempt.title || null,
      subtext: joinedMove?.subtext || linkedMove?.subtext || attempt.subtext || null
    }
  }, [moveById])

  const todayAttempt = useMemo(() => {
    const realAttempt = attempts.find((attempt) => attempt.cycle_date === today)
    if (realAttempt) return enrichAttempt(realAttempt)
    return null
  }, [attempts, today, enrichAttempt])

  const activeMove = useMemo(() => {
    if (!todayAttempt) return selectedMove

    const matchedMove = userMoves.find((move) => move.id === todayAttempt.user_move_id)
    if (matchedMove) {
      return {
        ...matchedMove,
        title: matchedMove.title || selectedMove.title,
        subtext: matchedMove.subtext || selectedMove.subtext
      }
    }

    return selectedMove
  }, [todayAttempt, userMoves, selectedMove])

  const yesterdayAttempt = useMemo(() => {
    const realAttempt = attempts.find((attempt) => attempt.cycle_date === yesterday)
    if (realAttempt) return enrichAttempt(realAttempt)
    return null
  }, [attempts, yesterday, enrichAttempt])

  const persistedDismissed =
    typeof window !== "undefined" && localStorage.getItem(dismissKey) === "true"
  const shouldAskYesterday =
    !loading &&
    (
      forceFeedbackOpen ||
      (
        phase2Day > 1 &&
        yesterdayAttempt?.completion_status === "pending" &&
        !dismissedFeedback &&
        !persistedDismissed
      )
    )

  const acceptTodayMove = async () => {
    if (todayAttempt || !userId || !selectedMove) return

    const existingActiveMove = userMoves.find((move) => move.status === "active" && move.id !== selectedMove.id)
    if (existingActiveMove) {
      console.error("Cannot accept a new move while another move is active.")
      return
    }

    const { error } = await supabase
      .from("move_attempts")
      .insert([
        {
          user_move_id: selectedMove.id,
          user_id: userId,
          cycle_date: today,
          completion_status: "pending"
        }
      ])

    if (error) {
      console.error("Could not accept move:", error)
      return
    }

    const { error: moveStatusError } = await supabase
      .from("user_moves")
      .update({
        status: "active",
        updated_at: new Date().toISOString()
      })
      .eq("id", selectedMove.id)
      .eq("user_id", userId)

    if (moveStatusError) {
      console.error("Could not set move to active:", moveStatusError)
    }

    fetchMoves()
  }

  const submitFeedback = async (status, partlyReason = null) => {
    if (!yesterdayAttempt) {
      setDismissedFeedback(true)
      return
    }

    const { error } = await supabase
      .from("move_attempts")
      .update({
        completion_status: status,
        feedback_at: new Date().toISOString(),
        partly_reason: status === "partly" && partlyReason ? partlyReason : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", yesterdayAttempt.id)

    if (error) {
      console.error("Could not save move feedback:", error)
      return
    }

    let nextMoveStatus = "paused"
    if (status === "did_it") nextMoveStatus = "completed"

    const { error: moveStatusError } = await supabase
      .from("user_moves")
      .update({
        status: nextMoveStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", yesterdayAttempt.user_move_id)
      .eq("user_id", userId)

    if (moveStatusError) {
      console.error("Could not update move status:", moveStatusError)
    }

    setDismissedFeedback(true)
    setForceFeedbackOpen(false)
    localStorage.setItem(dismissKey, "true")
    fetchMoves()
  }

  const seedDemoYesterday = async () => {
    if (!userId) return

    const todayAttempt = attempts.find((attempt) => attempt.cycle_date === today && attempt.completion_status === "pending")
    if (!todayAttempt) return

    const { error } = await supabase
      .from("move_attempts")
      .update({
        cycle_date: yesterday,
        updated_at: new Date().toISOString()
      })
      .eq("id", todayAttempt.id)
      .eq("user_id", userId)

    if (error) {
      console.error("Could not simulate yesterday attempt:", error)
      return
    }

    setDismissedFeedback(false)
    setForceFeedbackOpen(false)
    localStorage.removeItem(dismissKey)
    fetchMoves()
  }

  const weekSummary = useMemo(() => {
    const combined = attempts
      .slice()
      .sort((a, b) => a.cycle_date.localeCompare(b.cycle_date))
      .slice(-7)

    const completed = combined.filter((attempt) => attempt.completion_status === "did_it").length
    const partly = combined.filter((attempt) => attempt.completion_status === "partly").length
    return { days: combined, completed, partly, total: Math.max(combined.length, 1) }
  }, [attempts])

  const monthSummary = useMemo(() => {
    const combined = attempts
    const byDate = new Map(combined.map((attempt) => [attempt.cycle_date, attempt]))
    const days = daysInCurrentMonth().map((date) => ({
      date,
      attempt: byDate.get(date) || null
    }))
    const completed = days.filter((day) => day.attempt?.completion_status === "did_it").length
    const partly = days.filter((day) => day.attempt?.completion_status === "partly").length
    const attempted = days.filter((day) => day.attempt).length

    return {
      days,
      completed,
      partly,
      attempted,
      total: days.length
    }
  }, [attempts])

  return {
    loading,
    phase2Day,
    selectedMove: activeMove,
    todayAttempt,
    yesterdayAttempt,
    shouldAskYesterday,
    weekSummary,
    monthSummary,
    acceptTodayMove,
    submitFeedback,
    swapMove: () => setSwapOffset((value) => value + 1),
    skipFeedback: () => {
      setDismissedFeedback(true)
      setForceFeedbackOpen(false)
      localStorage.setItem(dismissKey, "true")
    },
    seedDemoYesterday
  }
}
