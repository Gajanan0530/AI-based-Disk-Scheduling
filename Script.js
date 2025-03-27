<script>
        let simulationRunning = false;
        let paused = false;
        let sequence = [];
        let currentStep = 0;
        const history = [];

        function startSimulation() {
            if (simulationRunning) return;
            simulationRunning = true;
            const head = parseInt(document.getElementById('headPosition').value);
            const requests = document.getElementById('requests').value.split(',').map(Number);
            const algorithm = document.getElementById('algorithm').value;
            document.getElementById('currentAlgo').textContent = algorithm.toUpperCase();
            sequence = simulateAlgorithm(algorithm, head, requests);
            currentStep = 0;
            animateSimulation(head, sequence);
        }

        function pauseSimulation() {
            paused = true;
        }

        function resumeSimulation() {
            paused = false;
            animateSimulation(parseInt(document.getElementById('headPosition').value), sequence);
        }

        function resetSimulation() {
            simulationRunning = false;
            paused = false;
            document.getElementById('progress-bar').style.width = '0%';
            document.getElementById('seekTime').textContent = '0';
            document.getElementById('responseTime').textContent = '0';
            document.getElementById('throughput').textContent = '0';
            const ctx = document.getElementById('canvas').getContext('2d');
            ctx.clearRect(0, 0, 800, 400);
        }

        function simulateAlgorithm(algorithm, head, requests) {
            let seq = [...requests];
            if (algorithm === 'sstf') {
                return sstf(head, seq);
            } else if (algorithm === 'ai') {
                return seq.sort((a, b) => a - b); // Simulated AI
            }
            return seq; // FCFS or others simplified
        }

        function sstf(head, requests) {
            let sequence = [];
            let remaining = [...requests];
            let current = head;
            while (remaining.length > 0) {
                let closest = remaining.reduce((prev, curr) => 
                    Math.abs(curr - current) < Math.abs(prev - current) ? curr : prev);
                sequence.push(closest);
                current = closest;
                remaining = remaining.filter(x => x !== closest);
            }
            return sequence;
        }

        function animateSimulation(head, sequence) {
            if (!simulationRunning || paused || currentStep >= sequence.length) {
                if (currentStep >= sequence.length) {
                    updateHistory(sequence);
                }
                return;
            }
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const maxValue = Math.max(head, ...sequence, 200);
            const scaleY = canvas.height / maxValue;
            const stepX = canvas.width / (sequence.length + 1);

            ctx.beginPath();
            ctx.moveTo(0, canvas.height - head * scaleY);
            let points = [head, ...sequence.slice(0, currentStep + 1)];

            for (let i = 0; i < points.length; i++) {
                let x = i * stepX;
                let y = canvas.height - points[i] * scaleY;
                ctx.lineTo(x, y);
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#4CAF50';
                ctx.fill();
            }

            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.stroke();

            const seekTime = calculateSeekTime(head, points.slice(1));
            document.getElementById('seekTime').textContent = seekTime;
            document.getElementById('responseTime').textContent = (seekTime / points.length).toFixed(2);
            document.getElementById('throughput').textContent = points.length;
            document.getElementById('progress-bar').style.width = `${(currentStep + 1) / sequence.length * 100}%`;

            currentStep++;
            requestAnimationFrame(() => animateSimulation(head, sequence));
        }

        function calculateSeekTime(head, sequence) {
            let total = Math.abs(head - sequence[0]);
            for (let i = 1; i < sequence.length; i++) {
                total += Math.abs(sequence[i] - sequence[i - 1]);
            }
            return total;
        }

        function updateHistory(sequence) {
            const algo = document.getElementById('algorithm').value;
            const seek = document.getElementById('seekTime').textContent;
            const response = document.getElementById('responseTime').textContent;
            const throughput = document.getElementById('throughput').textContent;
            history.push({ algo, seek, response, throughput });
            const table = document.getElementById('historyTable');
            table.innerHTML = history.map(h => `
                <tr>
                    <td>${h.algo.toUpperCase()}</td>
                    <td>${h.seek}</td>
                    <td>${h.response}</td>
                    <td>${h.throughput}</td>
                </tr>`).join('');
        }

        function saveConfig() {
            const config = {
                head: document.getElementById('headPosition').value,
                requests: document.getElementById('requests').value,
                algorithm: document.getElementById('algorithm').value,
                workload: document.getElementById('workload').value
            };
            localStorage.setItem('diskConfig', JSON.stringify(config));
            alert('Configuration saved!');
        }

        function loadConfig() {
            const config = JSON.parse(localStorage.getItem('diskConfig'));
            if (config) {
                document.getElementById('headPosition').value = config.head;
                document.getElementById('requests').value = config.requests;
                document.getElementById('algorithm').value = config.algorithm;
                document.getElementById('workload').value = config.workload;
                alert('Configuration loaded!');
            }
        }

        function showHelp() {
            alert('Use the controls to set parameters and run simulations. Hover over metrics for tooltips!');
        }

        function showFeedback() {
            const feedback = prompt('Please provide your feedback:');
            if (feedback) alert('Thank you for your feedback!');
        }
    </script>
