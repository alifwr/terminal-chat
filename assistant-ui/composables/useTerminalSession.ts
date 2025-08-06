export const useTerminalSession = () => {
    const sessionId = useState<string>('sessionId', () => '');

    const updateSession = (newSessionId: string) => {
        if (process.client) {
            sessionId.value = newSessionId;
        }
    }

    return {
        sessionId: readonly(sessionId),
        updateSession
    }
}