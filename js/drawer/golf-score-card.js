import { DrawerUtils } from './utils.js';

// Mobile-friendly golf score card prototype
export const GolfScoreCardHandler = {
    async init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();

        // Example data for prototyping
        const courseName = "Kyssinge Golf (18 holes)";
        const players = [
            { name: "berndt", hcp: 0.8, shcp: -2, tee: 57, totalStrokes: 15, totalPoints: 5 },
            { name: "player2", hcp: 1.2, shcp: -1, tee: 58, totalStrokes: 16, totalPoints: 4 },
            { name: "player3", hcp: 2.0, shcp: 0, tee: 59, totalStrokes: 17, totalPoints: 3 },
            { name: "player4", hcp: 3.0, shcp: 1, tee: 60, totalStrokes: 18, totalPoints: 2 }
        ];
        const holes = [
            { num: 1, par: 4, index: 11, strokes: 5, points: 1 },
            { num: 2, par: 5, index: 17, strokes: 5, points: 2 },
            { num: 3, par: 5, index: 5, strokes: 5, points: 2 },
            { num: 4, par: 4, index: 3, strokes: 4, points: 2 },
            { num: 5, par: 3, index: 15, strokes: 3, points: 2 },
            { num: 6, par: 4, index: 7, strokes: 4, points: 2 },
            { num: 7, par: 4, index: 1, strokes: 4, points: 2 },
            { num: 8, par: 3, index: 13, strokes: 3, points: 2 },
            { num: 9, par: 5, index: 9, strokes: 5, points: 2 },
            { num: 10, par: 4, index: 12, strokes: 4, points: 2 },
            { num: 11, par: 5, index: 18, strokes: 5, points: 2 },
            { num: 12, par: 5, index: 6, strokes: 5, points: 2 },
            { num: 13, par: 4, index: 4, strokes: 4, points: 2 },
            { num: 14, par: 3, index: 16, strokes: 3, points: 2 },
            { num: 15, par: 4, index: 8, strokes: 4, points: 2 },
            { num: 16, par: 4, index: 2, strokes: 4, points: 2 },
            { num: 17, par: 3, index: 14, strokes: 3, points: 2 },
            { num: 18, par: 5, index: 10, strokes: 5, points: 2 }
        ];

        mainContent.innerHTML = `
            <div class="space-y-4">
                <div class="sticky top-0 bg-white z-10 pb-2">
                    <div class="text-lg font-semibold">${courseName}</div>
                    <div class="flex items-center justify-between mt-1">
                        <div class="font-medium">${players[0].name} (Hcp: ${players[0].hcp})</div>
                        <div class="text-sm text-gray-500">Total: <span class="font-bold">${players[0].totalStrokes}</span> strokes, <span class="font-bold text-green-600">${players[0].totalPoints}</span> pts</div>
                    </div>
                </div>
                <div id="add-player-form" class="hidden bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                    <div class="font-semibold mb-2">Add Player</div>
                    <input id="new-player-name" type="text" class="input-primary w-full" placeholder="Name" />
                    <input id="new-player-hcp" type="number" class="input-primary w-full" placeholder="Handicap" />
                    <div class="flex gap-2 mt-2">
                        <button id="add-player-confirm" class="btn-primary flex-1">Add</button>
                        <button id="add-player-cancel" class="btn-primary bg-gray-300 text-gray-700 flex-1">Cancel</button>
                    </div>
                </div>
                <div id="holes-list" class="divide-y rounded-lg border border-gray-200 bg-white">
                    <div class="flex items-center px-2 py-2 gap-2 bg-gray-100 font-semibold">
                        <div class="w-8 text-center" rowspan="2">Hole</div>
                        <div class="w-10 text-center" rowspan="2">Par</div>
                        <div class="w-12 text-center" rowspan="2">HCP</div>
                        ${players.map((player, idx) => `
                            <div class="flex flex-col items-center w-20" style="min-width:48px;">
                                <div class="text-xs text-gray-700">${player.name}</div>
                                <div class="flex w-full">
                                    <div class="w-1/2 text-xs text-gray-500">Score</div>
                                    <div class="w-1/2 text-xs text-gray-500">PTs</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${holes.map(hole => `
                        <div class="flex items-center px-2 py-2 gap-2 golf-hole-row" data-hole="${hole.num}">
                            <div class="w-8 text-center font-bold text-gray-700">${hole.num}</div>
                            <div class="w-10 text-center text-xs text-gray-500">${hole.par}</div>
                            <div class="w-12 text-center text-xs text-gray-400">${hole.index}</div>
                            ${players.map((player, idx) => `
                                <div class="flex w-20 items-center" style="min-width:48px;">
                                    <input type="number" min="1" max="15" value="${hole.strokes}" class="w-1/2 text-center rounded border border-gray-300 focus:ring-2 focus:ring-indigo-400 font-bold" data-player="${idx}" data-hole="${hole.num}" />
                                    <div class="w-1/2 text-center font-semibold text-green-700">${hole.points}</div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
                <div class="flex justify-between mt-4">
                    <button id="add-player-btn" class="btn-primary">Add Player</button>
                    <button id="next-hole-btn" class="btn-primary">Next Hole</button>
                </div>
            </div>
        `;

        // Add Player button logic (UI only)
        document.getElementById('add-player-btn').onclick = () => {
            document.getElementById('add-player-form').classList.remove('hidden');
        };
        document.getElementById('add-player-cancel').onclick = () => {
            document.getElementById('add-player-form').classList.add('hidden');
        };
        document.getElementById('add-player-confirm').onclick = () => {
            // UI only: just close the form and show a toast
            document.getElementById('add-player-form').classList.add('hidden');
            alert('Player added (UI only, not persistent)');
        };

        // Next Hole button logic (UI only)
        let currentHole = 1;
        document.getElementById('next-hole-btn').onclick = () => {
            const rows = Array.from(document.querySelectorAll('.golf-hole-row'));
            if (currentHole < rows.length) {
                rows.forEach(row => row.classList.remove('bg-yellow-100'));
                rows[currentHole].scrollIntoView({ behavior: 'smooth', block: 'center' });
                rows[currentHole].classList.add('bg-yellow-100');
                currentHole++;
            } else {
                alert('You are at the last hole!');
            }
        };
    }
}; 