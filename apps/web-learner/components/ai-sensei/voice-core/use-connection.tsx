"use client"

import React, { createContext, useCallback, useContext, useState } from "react"

interface VoiceConnectionDetails {
    wsUrl: string
    token: string
    roomId: string
    shouldConnect: boolean
    sessionKey: number
}

interface VoiceConnectionContextValue {
    wsUrl: string
    token: string
    roomId: string
    shouldConnect: boolean
    sessionKey: number
    connect: (graphName?: string, geminiApiKey?: string) => Promise<{ token: string; wsUrl: string; roomId: string }>
    disconnect: () => void
}

const VoiceConnectionContext = createContext<VoiceConnectionContextValue | undefined>(undefined)

export function VoiceConnectionProvider({ children }: { children: React.ReactNode }) {
    const [connectionDetails, setConnectionDetails] = useState<VoiceConnectionDetails>({
        wsUrl: "",
        token: "",
        roomId: "",
        shouldConnect: false,
        sessionKey: 0,
    })

    const connect = useCallback(async (graphName?: string, geminiApiKey?: string) => {
        const abortController = new AbortController()
        const timeoutId = window.setTimeout(() => {
            abortController.abort()
        }, 10000)

        let response: Response
        try {
            response = await fetch("/api/voice-agent/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ graphName, geminiApiKey }),
                cache: "no-store",
                signal: abortController.signal,
            })
        } catch (error: any) {
            if (error?.name === "AbortError") {
                throw new Error("Timeout khi lấy token voice-agent. Vui lòng thử lại.")
            }
            throw error
        } finally {
            window.clearTimeout(timeoutId)
        }

        if (!response.ok) {
            const message = await response.text().catch(() => "Failed to get LiveKit token")
            throw new Error(message || "Failed to get LiveKit token")
        }

        const data = (await response.json()) as {
            token: string
            wsUrl: string
            roomId: string
        }

        setConnectionDetails((prev) => ({
            wsUrl: data.wsUrl,
            token: data.token,
            roomId: data.roomId,
            shouldConnect: true,
            sessionKey: prev.sessionKey + 1,
        }))

        return data
    }, [])

    const disconnect = useCallback(() => {
        setConnectionDetails((prev) => ({
            ...prev,
            shouldConnect: false,
        }))
    }, [])

    return (
        <VoiceConnectionContext.Provider
            value={{
                wsUrl: connectionDetails.wsUrl,
                token: connectionDetails.token,
                roomId: connectionDetails.roomId,
                shouldConnect: connectionDetails.shouldConnect,
                sessionKey: connectionDetails.sessionKey,
                connect,
                disconnect,
            }}
        >
            {children}
        </VoiceConnectionContext.Provider>
    )
}

export function useVoiceConnection() {
    const context = useContext(VoiceConnectionContext)
    if (!context) {
        throw new Error("useVoiceConnection must be used within VoiceConnectionProvider")
    }
    return context
}
