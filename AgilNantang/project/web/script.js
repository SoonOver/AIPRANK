document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    const downloadBtn = document.getElementById('downloadBtn');
    const autoDownloadLink = document.getElementById('autoDownload');

    // Talos Swarm Logs
    const logs = [
        "connecting to talos_swarm_mesh...",
        "handshake: gemini_3_flash [OK]",
        "handshake: search_cluster_alpha [OK]",
        "synchronizing local memory engine...",
        "sanitizing builder pipeline patterns...",
        "gateway status: Telegram [CONNECTED]",
        "gateway status: WhatsApp [STANDBY]",
        "rate_limiter: initialized for all users",
        "system_status: OPTIMIZED",
        "talos_core is now orchestrating."
    ];

    let logIndex = 0;

    function addLogLine() {
        if (logIndex < logs.length) {
            const line = document.createElement('div');
            line.className = 'line';
            line.innerHTML = `<span class="prompt">talos@system:~$</span> ${logs[logIndex]}`;
            terminal.appendChild(line);
            logIndex++;
            
            terminal.scrollTop = terminal.scrollHeight;
            
            setTimeout(addLogLine, Math.random() * 800 + 400);
        }
    }

    // Start terminal mock
    setTimeout(addLogLine, 1000);

    // Auto Download Logic
    function triggerDownload() {
        console.log("Triggering download...");
        // Fallback for browsers that block direct .click()
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        autoDownloadLink.dispatchEvent(clickEvent);
    }

    // Attempt auto-download after 3 seconds to let the UI settle
    setTimeout(() => {
        triggerDownload();
    }, 3000);

    // Manual Download
    downloadBtn.addEventListener('click', () => {
        triggerDownload();
    });
});
