export const useTerminalSession = () => {
    const sessionId = useState<string>('sessionId', () => '');

    return {
        sessionId: sessionId,
    }
}