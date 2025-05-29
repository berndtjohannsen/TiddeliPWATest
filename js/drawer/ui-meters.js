import { DrawerUtils } from './utils.js';

export const UIMetersHandler = {
    interval: null,
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">UI Meter & Gauge Demo</h2>
                <div class="card flex flex-col gap-6">
                    <div>
                        <h3 class="card-title mb-2">Progress Bar</h3>
                        <div class="w-full bg-gray-200 rounded-full h-4">
                            <div id="progress-bar" class="bg-indigo-500 h-4 rounded-full transition-all duration-300" style="width: 40%"></div>
                        </div>
                        <div class="flex gap-2 mt-2">
                            <button class="btn-primary" id="progress-inc">+10%</button>
                            <button class="btn-primary" id="progress-dec">-10%</button>
                        </div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Circular Gauge</h3>
                        <div class="flex items-center gap-4">
                            <svg id="gauge-svg" width="80" height="80" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="32" stroke="#e5e7eb" stroke-width="10" fill="none" />
                                <circle id="gauge-arc" cx="40" cy="40" r="32" stroke="#6366f1" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="201" stroke-dashoffset="60" transform="rotate(-90 40 40)" />
                            </svg>
                            <span id="gauge-value" class="text-lg font-bold">70</span>
                        </div>
                        <div class="flex gap-2 mt-2">
                            <button class="btn-primary" id="gauge-inc">+10</button>
                            <button class="btn-primary" id="gauge-dec">-10</button>
                        </div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Numeric Meter</h3>
                        <meter id="num-meter" min="0" max="100" value="50" class="w-full h-6"></meter>
                        <div class="flex gap-2 mt-2">
                            <button class="btn-primary" id="meter-inc">+10</button>
                            <button class="btn-primary" id="meter-dec">-10</button>
                        </div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Slider (Range Input)</h3>
                        <input type="range" id="slider" min="0" max="100" value="30" class="w-full">
                        <div class="text-sm mt-2">Value: <span id="slider-value">30</span></div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Vertical Bar Meter</h3>
                        <div class="flex items-end h-32 w-8 bg-gray-200 rounded relative overflow-hidden">
                            <div id="bar-meter-fill" class="bg-green-500 w-full absolute bottom-0 transition-all duration-300" style="height: 60%"></div>
                        </div>
                        <div class="flex gap-2 mt-2">
                            <button class="btn-primary" id="bar-meter-inc">+10%</button>
                            <button class="btn-primary" id="bar-meter-dec">-10%</button>
                        </div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Thermometer</h3>
                        <div class="flex items-end h-32 w-8 relative">
                            <svg width="32" height="128" viewBox="0 0 32 128">
                                <rect x="12" y="10" width="8" height="90" rx="4" fill="#e5e7eb" />
                                <circle cx="16" cy="110" r="14" fill="#e5e7eb" />
                                <rect id="thermo-fill" x="12" y="100" width="8" height="0" rx="4" fill="#f87171" />
                                <circle id="thermo-bulb" cx="16" cy="110" r="10" fill="#f87171" />
                            </svg>
                        </div>
                        <div class="flex gap-2 mt-2">
                            <button class="btn-primary" id="thermo-inc">+10°</button>
                            <button class="btn-primary" id="thermo-dec">-10°</button>
                        </div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">LED Indicator</h3>
                        <div class="flex items-center gap-2">
                            <span id="led-indicator" class="inline-block w-6 h-6 rounded-full bg-green-500 border-2 border-gray-300"></span>
                            <span id="led-label" class="text-sm">OK</span>
                        </div>
                        <div class="flex gap-2 mt-2">
                            <button class="btn-primary" id="led-cycle">Cycle</button>
                        </div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Segmented Bar</h3>
                        <div class="flex gap-1">
                            <div id="seg-0" class="w-4 h-6 rounded bg-gray-300"></div>
                            <div id="seg-1" class="w-4 h-6 rounded bg-gray-300"></div>
                            <div id="seg-2" class="w-4 h-6 rounded bg-gray-300"></div>
                            <div id="seg-3" class="w-4 h-6 rounded bg-gray-300"></div>
                            <div id="seg-4" class="w-4 h-6 rounded bg-gray-300"></div>
                        </div>
                        <div class="flex gap-2 mt-2">
                            <button class="btn-primary" id="seg-inc">+1</button>
                            <button class="btn-primary" id="seg-dec">-1</button>
                        </div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Digital Numeric Display</h3>
                        <div class="flex items-center justify-center">
                            <span id="digital-num" class="font-mono text-3xl bg-black text-green-400 px-4 py-2 rounded">42</span>
                        </div>
                        <div class="flex gap-2 mt-2">
                            <button class="btn-primary" id="digital-inc">+1</button>
                            <button class="btn-primary" id="digital-dec">-1</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.initEvents();
    },
    initEvents() {
        // Progress Bar
        let progress = 40;
        const progressBar = document.getElementById('progress-bar');
        document.getElementById('progress-inc').onclick = () => {
            progress = Math.min(100, progress + 10);
            progressBar.style.width = progress + '%';
        };
        document.getElementById('progress-dec').onclick = () => {
            progress = Math.max(0, progress - 10);
            progressBar.style.width = progress + '%';
        };
        // Circular Gauge
        let gauge = 70;
        const gaugeArc = document.getElementById('gauge-arc');
        const gaugeValue = document.getElementById('gauge-value');
        function updateGauge() {
            // Circumference = 2 * PI * r = 2 * 3.14 * 32 ≈ 201
            const offset = 201 - (gauge / 100) * 201;
            gaugeArc.setAttribute('stroke-dashoffset', offset);
            gaugeValue.textContent = gauge;
        }
        document.getElementById('gauge-inc').onclick = () => {
            gauge = Math.min(100, gauge + 10);
            updateGauge();
        };
        document.getElementById('gauge-dec').onclick = () => {
            gauge = Math.max(0, gauge - 10);
            updateGauge();
        };
        updateGauge();
        // Numeric Meter
        let meter = 50;
        const numMeter = document.getElementById('num-meter');
        document.getElementById('meter-inc').onclick = () => {
            meter = Math.min(100, meter + 10);
            numMeter.value = meter;
        };
        document.getElementById('meter-dec').onclick = () => {
            meter = Math.max(0, meter - 10);
            numMeter.value = meter;
        };
        // Slider
        const slider = document.getElementById('slider');
        const sliderValue = document.getElementById('slider-value');
        slider.oninput = () => {
            sliderValue.textContent = slider.value;
        };
        // --- Vertical Bar Meter ---
        let barMeter = 60;
        const barMeterFill = document.getElementById('bar-meter-fill');
        function updateBarMeter() {
            barMeterFill.style.height = barMeter + '%';
            barMeterFill.className = 'w-full absolute bottom-0 transition-all duration-300 ' +
                (barMeter > 70 ? 'bg-green-500' : barMeter > 30 ? 'bg-yellow-400' : 'bg-red-500');
        }
        document.getElementById('bar-meter-inc').onclick = () => {
            barMeter = Math.min(100, barMeter + 10);
            updateBarMeter();
        };
        document.getElementById('bar-meter-dec').onclick = () => {
            barMeter = Math.max(0, barMeter - 10);
            updateBarMeter();
        };
        updateBarMeter();
        // --- Thermometer ---
        let thermo = 20;
        const thermoFill = document.getElementById('thermo-fill');
        const thermoBulb = document.getElementById('thermo-bulb');
        function updateThermo() {
            // Fill height: 0 (min) to 90 (max)
            const fillHeight = Math.max(0, Math.min(90, (thermo / 100) * 90));
            thermoFill.setAttribute('y', 100 - fillHeight);
            thermoFill.setAttribute('height', fillHeight);
            // Color: blue (<30), yellow (30-70), red (>70)
            let color = '#f87171';
            if (thermo < 30) color = '#60a5fa';
            else if (thermo < 70) color = '#fbbf24';
            thermoFill.setAttribute('fill', color);
            thermoBulb.setAttribute('fill', color);
        }
        document.getElementById('thermo-inc').onclick = () => {
            thermo = Math.min(100, thermo + 10);
            updateThermo();
        };
        document.getElementById('thermo-dec').onclick = () => {
            thermo = Math.max(0, thermo - 10);
            updateThermo();
        };
        updateThermo();
        // --- LED Indicator ---
        let ledState = 0;
        const ledIndicator = document.getElementById('led-indicator');
        const ledLabel = document.getElementById('led-label');
        function updateLED() {
            const states = [
                { color: 'bg-green-500', label: 'OK' },
                { color: 'bg-yellow-400', label: 'WARN' },
                { color: 'bg-red-500', label: 'ALERT' }
            ];
            const s = states[ledState];
            ledIndicator.className = `inline-block w-6 h-6 rounded-full border-2 border-gray-300 ${s.color}`;
            ledLabel.textContent = s.label;
        }
        document.getElementById('led-cycle').onclick = () => {
            ledState = (ledState + 1) % 3;
            updateLED();
        };
        updateLED();
        // --- Segmented Bar ---
        let seg = 3;
        function updateSeg() {
            for (let i = 0; i < 5; ++i) {
                document.getElementById('seg-' + i).className = 'w-4 h-6 rounded ' + (i < seg ? 'bg-indigo-500' : 'bg-gray-300');
            }
        }
        document.getElementById('seg-inc').onclick = () => {
            seg = Math.min(5, seg + 1);
            updateSeg();
        };
        document.getElementById('seg-dec').onclick = () => {
            seg = Math.max(0, seg - 1);
            updateSeg();
        };
        updateSeg();
        // --- Digital Numeric Display ---
        let digital = 42;
        const digitalNum = document.getElementById('digital-num');
        function updateDigital() {
            digitalNum.textContent = digital;
        }
        document.getElementById('digital-inc').onclick = () => {
            digital = Math.min(999, digital + 1);
            updateDigital();
        };
        document.getElementById('digital-dec').onclick = () => {
            digital = Math.max(0, digital - 1);
            updateDigital();
        };
        updateDigital();
    }
}; 