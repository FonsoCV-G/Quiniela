// Datos de ejemplo - EDITA AQUÍ TUS DATOS
// Array de los jugadores de cada uno 
let quinielaData = {
    jugadores: [
        {
            nombre: "Carlos",
            color: "#FF6384",
            avatarBase: "Carlos Mediocre.png", // Cara base del jugador
            avatarMalo: "Carlos Imagen Perdedor.png", // Cuando tiene pocos aciertos
            avatarBueno: "Carlos Ganador.png", // Cuando tiene muchos aciertos
            avatarPerfecto: "🏆", // Para resultados excepcionales
            aciertos: [5, 7, 5, 5, 3, 7, 5, 5, 7, 8, 8, 8, 7, 6, 5]
        },
        {
            nombre: "Alfonso",
            color: "#36A2EB", 
            avatarBase: "Alfonso Perdedor.png",
            avatarMalo: "Alfonso SuperPerdedor.png",
            avatarBueno: "😎",
            avatarPerfecto: "👑",
            aciertos: [5, 8, 5, 5, 6, 7, 4, 7, 5, 10, 6, 8, 8, 5, 6]
        },
        {
            nombre: "Alex",
            color: "#FFCE56",
            avatarBase: "alex_Base.png",
            avatarMalo: "alex_todas.png",
            avatarBueno: "Alex_Mediocre.png",
            avatarPerfecto: "🔥",
            aciertos: [5, 8, 4, 5, 7, 4, 6, 7, 7, 5, 7, 5, 5, 9, 5]
        },
        {
            nombre: "Fernando",
            color: "#4BC0C0",
            avatarBase: "Fernando Perdedor.png",
            avatarMalo: "Fernando Mediocre.png",
            avatarBueno: "🚀",
            avatarPerfecto: "💎",
            aciertos: [4, 8, 9, 8, 7, 5, 6, 3, 4, 9, 8, 5, 9, 8, 6]
        },
        {
            nombre: "Pedro",
            color: "#9966FF",
            avatarBase: "Pedro Perdedor.png",
            avatarMalo: "Gif-PEDRO.gif",
            avatarBueno: "Pedro MediocreAlto.png",
            avatarPerfecto: "⚡",
            aciertos: [9, 6, 4, 7, 6, 8, 7, 5, 8, 5, 10, 7, 7, 8, 5]
        },
        {
            nombre: "Juanmi",
            color: "#FF9F40",
            avatarBase: "Juanmi_Regular.gif",
            avatarMalo: "Juanmi_Regular.gif",
            avatarBueno: "STK-20250826-WA0034.webp",
            avatarPerfecto: "🌟",
            aciertos: [null, null, null, null, null, null, null, null, null, 5, 9, 6, 5, 5, 6]
        }
    ]
};

// Función para determinar qué avatar usar según los aciertos
//Esta función es importante porque según los aciertos devolverá una imagen u otra
//Se usa tanto para las estadísticas de la gráfica como abajo en las estadísticas
//individuales
function getAvatarForScore(jugador, aciertos) {
    if (aciertos >= 14) return jugador.avatarPerfecto;
    if (aciertos >= 12) return jugador.avatarBueno;
    if (aciertos <= 7) return jugador.avatarMalo;
    return jugador.avatarBase;
}

// Plugin personalizado para dibujar imágenes en los puntos
//Punto importante
const imagePointPlugin = {
    id: 'imagePoints',
    afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        
        chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            const jugador = quinielaData.jugadores[datasetIndex];
            
            meta.data.forEach((point, index) => {
                const aciertos = dataset.data[index];
                
                // Si el valor es null (jugador no participó), no dibujar nada
                if (aciertos === null) return;
                
                const avatar = getAvatarForScore(jugador, aciertos);
                
                // Fondo circular con color del jugador
                ctx.beginPath();
                ctx.arc(point.x, point.y, 20, 0, 2 * Math.PI);
                ctx.fillStyle = jugador.color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Si el avatar es una imagen (termina en .png, .jpg, .jpeg, .gif)
                if (typeof avatar === "string" && avatar.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
                    const img = new Image();
                    img.onload = function () {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, 18, 0, 2 * Math.PI);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(img, point.x - 18, point.y - 18, 36, 36);
                        ctx.restore();
                    };
                    img.src = avatar;
                } else {
                    // Si es emoji, dibujar texto
                    ctx.font = 'bold 22px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#fff';
                    ctx.fillText(avatar, point.x, point.y);
                }
            });
        });
    }
};

let chart;

// Crear el gráfico
function createChart() {
    const ctx = document.getElementById('quinielaChart').getContext('2d');
    const wrapper = ctx.canvas.parentElement;
    
    // Calcular ancho basado en número de jornadas (más espacio = menos apegotonado)
    const numJornadas = quinielaData.jugadores[0].aciertos.length;
    const anchoMinimo = Math.max(1500, numJornadas * 120); // 120px por jornada
    
    wrapper.style.minWidth = anchoMinimo + 'px';
    ctx.canvas.style.width = '100%';
    ctx.canvas.style.height = '100%';

    // Preparar datos para Chart.js
    const jornadas = Array.from({ length: numJornadas }, (_, i) => `J${i + 1}`);

    const datasets = quinielaData.jugadores.map((jugador, jugadorIndex) => ({
        label: jugador.nombre,
        data: jugador.aciertos,
        borderColor: jugador.color,
        backgroundColor: jugador.color + '20',
        borderWidth: 4,
        pointRadius: 0, // Ocultar puntos normales, usaremos nuestras imágenes
        pointHoverRadius: 0,
        tension: 0.3,
        fill: false,
        spanGaps: true // Importante: conectar líneas aunque haya valores null
    }));

    if (chart) {
        chart.destroy();
    }

    // Registrar el plugin personalizado
    Chart.register(imagePointPlugin);

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: jornadas,
            datasets: datasets
        },
        plugins: [imagePointPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: false,
                        boxWidth: 40,
                        boxHeight: 3,
                        padding: 15,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        generateLabels: function(chart) {
                            return chart.data.datasets.map((dataset, i) => ({
                                text: dataset.label,
                                fillStyle: dataset.borderColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: 3,
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderWidth: 1,
                    cornerRadius: 10,
                    displayColors: false,
                    padding: 15,
                    callbacks: {
                        title: function (context) {
                            return `🗓️ Jornada ${context[0].dataIndex + 1}`;
                        },
                        label: function (context) {
                            const jugador = quinielaData.jugadores[context.datasetIndex];
                            const aciertos = context.parsed.y;
                            
                            if (aciertos === null) {
                                return ` ${jugador.nombre}: No jugó`;
                            }
                            
                            return ` ${jugador.nombre}: ${aciertos} aciertos`;
                        },
                        footer: function (context) {
                            const aciertos = context[0].parsed.y;
                            if (aciertos === null) return "";
                            if (aciertos >= 14) return "¡RESULTADO ÉPICO! 🔥";
                            if (aciertos >= 12) return "¡Muy bueno! 👍";
                            return "";
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '🗓️ Jornadas',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '🎯 Aciertos',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    max: 15,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: false,
                        boxWidth: 40,
                        boxHeight: 3,
                        padding: 15,
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        generateLabels: function(chart) {
                            return chart.data.datasets.map((dataset, i) => ({
                                text: dataset.label,
                                fillStyle: dataset.borderColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: 3,
                                hidden: false,
                                index: i
                            }));
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderWidth: 1,
                    cornerRadius: 10,
                    displayColors: false,
                    padding: 15,
                    callbacks: {
                        title: function (context) {
                            return `🗓️ Jornada ${context[0].dataIndex + 1}`;
                        },
                        label: function (context) {
                            const jugador = quinielaData.jugadores[context.datasetIndex];
                            const aciertos = context.parsed.y;
                            
                            if (aciertos === null) {
                                return ` ${jugador.nombre}: No jugó`;
                            }
                            
                            return ` ${jugador.nombre}: ${aciertos} aciertos`;
                        },
                        footer: function (context) {
                            const aciertos = context[0].parsed.y;
                            if (aciertos === null) return "";
                            if (aciertos >= 14) return "¡RESULTADO ÉPICO! 🔥";
                            if (aciertos >= 12) return "¡Muy bueno! 👍";
                            return "";
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '🗓️ Jornadas',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '🎯 Aciertos',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    beginAtZero: true,
                    max: 15,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Crear tarjetas de estadísticas
function createStatsCards() {
    const statsContainer = document.getElementById('statsGrid');
    statsContainer.innerHTML = '';

    // Ordenar jugadores por total de aciertos (de mayor a menor)
    const jugadoresOrdenados = [...quinielaData.jugadores].sort((a, b) => {
        const totalA = a.aciertos.filter(x => x !== null).reduce((x, y) => x + y, 0);
        const totalB = b.aciertos.filter(x => x !== null).reduce((x, y) => x + y, 0);
        return totalB - totalA;
    });

    jugadoresOrdenados.forEach((jugador, index) => {
        // Filtrar valores null para calcular correctamente las estadísticas
        const aciertosValidos = jugador.aciertos.filter(x => x !== null);
        const totalAciertos = aciertosValidos.reduce((a, b) => a + b, 0);
        const mediaAciertos = (totalAciertos / aciertosValidos.length).toFixed(1);
        const maxAciertos = Math.max(...aciertosValidos);
        const minAciertos = Math.min(...aciertosValidos);

        // Avatar según la media pinta el avatar redondo de las estadísticas
        //Segun el resultado devolverá una imagen u otra, por eso es importante getAvatarForScore
        const avatarMedia = getAvatarForScore(jugador, parseFloat(mediaAciertos));
        let avatarHtml;
        if (typeof avatarMedia === "string" && avatarMedia.match(/\.(png|jpg|webp|jpeg|gif)$/i)) {
            avatarHtml = `<img src="${avatarMedia}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        } else {
            avatarHtml = avatarMedia;
        }

        // Avatar mejor
        const avatarMejor = getAvatarForScore(jugador, maxAciertos);
        let avatarMejorHtml;
        if (typeof avatarMejor === "string" && avatarMejor.match(/\.(png|jpg|webp|jpeg|gif)$/i)) {
            avatarMejorHtml = `<img src="${avatarMejor}" alt="mejor" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;object-fit:cover;">`;
        } else {
            avatarMejorHtml = avatarMejor;
        }

        // Avatar peor
        const avatarPeor = getAvatarForScore(jugador, minAciertos);
        let avatarPeorHtml;
        if (typeof avatarPeor === "string" && avatarPeor.match(/\.(png|jpg|webp|jpeg|gif)$/i)) {
            avatarPeorHtml = `<img src="${avatarPeor}" alt="peor" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;object-fit:cover;">`;
        } else {
            avatarPeorHtml = avatarPeor;
        }

        const card = document.createElement('div');
        card.className = 'player-card';
        card.style.border = `3px solid ${jugador.color}`;

        // Medallas para las posiciones
        const badgeColors = [
            'linear-gradient(135deg, #FFD700, #FFA500)',
            'linear-gradient(135deg, #C0C0C0, #808080)',
            'linear-gradient(135deg, #CD7F32, #8B4513)',
            'linear-gradient(135deg, #667eea, #764ba2)'
        ];
        const badgeColor = index < 3 ? badgeColors[index] : badgeColors[3];
        const badgeText = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1;

        card.innerHTML = `
            <div style="position: absolute; top: -15px; left: -15px; width: 40px; height: 40px; border-radius: 50%; background: ${badgeColor}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white;">
                ${badgeText}
            </div>
            <div class="player-avatar" style="background-color: ${jugador.color}; width: 80px; height: 80px; border-radius: 50%; margin: 10px auto 15px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; font-weight: bold; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 3px solid white;">
                ${avatarHtml}
            </div>
            <div class="player-name" style="font-weight: bold; color: #333; margin-bottom: 15px; font-size: 20px;">${jugador.nombre}</div>
            <div class="player-stats" style="font-size: 14px; color: #666; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 8px;"><strong>🎯 Total:</strong> <span style="color: ${jugador.color}; font-weight: bold; font-size: 16px;">${totalAciertos}</span> aciertos</div>
                <div style="margin-bottom: 8px;"><strong>📊 Media:</strong> ${mediaAciertos}</div>
                <div style="margin-bottom: 8px;"><strong>⬆️ Mejor:</strong> ${maxAciertos} ${avatarMejorHtml}</div>
                <div><strong>⬇️ Peor:</strong> ${minAciertos} ${avatarPeorHtml}</div>
            </div>
        `;

        statsContainer.appendChild(card);
    });
}

// Función para añadir jornada
function addJornada() {
    const nuevosAciertos = prompt("Introduce los aciertos de la nueva jornada separados por comas\n(en el orden: " +
        quinielaData.jugadores.map(j => j.nombre).join(", ") + "):\n(Deja vacío para jugadores que no participaron)");

    if (nuevosAciertos) {
        const aciertos = nuevosAciertos.split(",").map(a => {
            const trimmed = a.trim();
            return trimmed === '' ? null : parseInt(trimmed);
        });

        if (aciertos.length === quinielaData.jugadores.length) {
            quinielaData.jugadores.forEach((jugador, index) => {
                jugador.aciertos.push(aciertos[index]);
            });
            updateChart();
        } else {
            alert("Error: Debes introducir " + quinielaData.jugadores.length + " valores (números o vacío)");
        }
    }
}

// Función para alternar modo de edición
function toggleEdit() {
    const editSection = document.getElementById('editSection');
    const dataEditor = document.getElementById('dataEditor');

    if (editSection.classList.contains('active')) {
        editSection.classList.remove('active');
    } else {
        editSection.classList.add('active');
        dataEditor.value = JSON.stringify(quinielaData, null, 2);
    }
}

// Función para actualizar datos desde el editor
function updateData() {
    const dataEditor = document.getElementById('dataEditor');
    try {
        const newData = JSON.parse(dataEditor.value);
        quinielaData = newData;
        updateChart();
        toggleEdit();
        alert("¡Datos actualizados correctamente! 🎉");
    } catch (error) {
        alert("Error en el formato JSON. Revisa la sintaxis.");
    }
}

// Función para resetear zoom
function resetZoom() {
    if (chart) {
        chart.resetZoom();
    }
}

// Actualizar todo el gráfico
function updateChart() {
    createChart();
    createStatsCards();
}

// Inicializar cuando carga la página
window.onload = function () {
    updateChart();
};