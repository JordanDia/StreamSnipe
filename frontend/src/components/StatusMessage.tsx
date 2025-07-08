import { useState, useEffect } from "react";

interface StatusMessageProps {
    active: boolean;
}

function StatusMessage({ active }: StatusMessageProps) {
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (!active) {
            setStatus(""); // reset when not active
            return;
        }

        const interval = setInterval(async () => {
            try {
                const res = await fetch("http://localhost:8000/status");
                const data = await res.json();
                setStatus(data.status);
            } catch (error) {
                setStatus("Error fetching status");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [active]);

    return <div>{status}</div>;
}

export default StatusMessage;
