 // Datos de ejemplo - EDITA AQUÍ TUS DATOS
        let quinielaData = {
            jugadores: [
                {
                    nombre: "Carlos",
                    color: "#FF6384",
                    avatarBase: "Carlos Mediocre.png", // Cara base del jugador
                    avatarMalo: "Carlos Imagen Perdedor.png", // Cuando tiene pocos aciertos
                    avatarBueno: "Carlos Ganador.png", // Cuando tiene muchos aciertos
                    avatarPerfecto: "🏆", // Para resultados excepcionales
                    aciertos: [5, 7, 5]
                },
                {
                    nombre: "Alfonso",
                    color: "#36A2EB", 
                    avatarBase: "Alfonso Perdedor.png",
                    avatarMalo: "Alfonso SuperPerdedor.png",
                    avatarBueno: "😍",
                    avatarPerfecto: "👑",
                    aciertos: [5, 8, 5]
                },
                {
                    nombre: "Alex",
                    color: "#FFCE56",
                    avatarBase: "alex_Base.png",
                    avatarMalo: "alex_todas.png",
                    avatarBueno: "Alex_Mediocre.png",
                    avatarPerfecto: "🔥",
                    aciertos: [5, 8, 4]
                },
                {
                    nombre: "Fernando",
                    color: "#4BC0C0",
                    avatarBase: "Fernando Perdedor.png",
                    avatarMalo: "Fernando Mediocre.png",
                    avatarBueno: "🚀",
                    avatarPerfecto: "💎",
                    aciertos: [4, 8, 9]
                },
                {
                    nombre: "Pedro",
                    color: "#9966FF",
                    avatarBase: "Pedro Perdedor.png",
                    avatarMalo: "Pedro MediocreAlto.png",
                    avatarBueno: "💪",
                    avatarPerfecto: "⚡",
                    aciertos: [9, 6, 4]
                }
            ]
        };

        // Función para determinar qué avatar usar según los aciertos
        function getAvatarForScore(jugador, aciertos) {
            if (aciertos >= 14) return jugador.avatarPerfecto;
            if (aciertos >= 12) return jugador.avatarBueno;
            if (aciertos <= 7) return jugador.avatarMalo;
            return jugador.avatarBase;
        }

        // Plugin personalizado para dibujar imágenes en los puntos
        const imagePointPlugin = {
            id: 'imagePoints',
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    const jugador = quinielaData.jugadores[datasetIndex];
                    
                    meta.data.forEach((point, index) => {
                        const aciertos = dataset.data[index];
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
                if (typeof avatar === "string" && avatar.match(/\.(png|jpg|jpeg|gif)$/i)) {
    const img = new Image();
    img.onload = function() {
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
            
            // Preparar datos para Chart.js
            const jornadas = Array.from({length: quinielaData.jugadores[0].aciertos.length}, (_, i) => `J${i + 1}`);
            
            const datasets = quinielaData.jugadores.map((jugador, jugadorIndex) => ({
                label: jugador.nombre,
                data: jugador.aciertos,
                borderColor: jugador.color,
                backgroundColor: jugador.color + '20',
                borderWidth: 4,
                pointRadius: 0, // Ocultar puntos normales, usaremos nuestras imágenes
                pointHoverRadius: 0,
                tension: 0.3,
                fill: false
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
                            display: false // Usaremos nuestra propia leyenda
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
                                title: function(context) {
                                    return `🗓️ Jornada ${context[0].dataIndex + 1}`;
                                },
                                label: function(context) {
    const jugador = quinielaData.jugadores[context.datasetIndex];
    const aciertos = context.parsed.y;
    const avatar = getAvatarForScore(jugador, aciertos);
    // Si es imagen, muestra solo el nombre o un emoji
    if (typeof avatar === "string" && avatar.match(/\.(png|jpg|jpeg|gif)$/i)) {
        return ` ${jugador.nombre}: ${aciertos} aciertos`;
    }
    return ` ${jugador.nombre}: ${aciertos} aciertos`;
},
                                footer: function(context) {
                                    const aciertos = context[0].parsed.y;
                                    if (aciertos >= 14) return "¡RESULTADO ÉPICO! 🔥";
                                    if (aciertos >= 12) return "¡Muy bueno! 👏";
                                
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

        // Crear leyenda personalizada con avatares
       // function createLegend() {
          //   const legendContainer = document.getElementById('legend');
         //    legendContainer.innerHTML = '';
            
            // quinielaData.jugadores.forEach(jugador => {
          //       const legendItem = document.createElement('div');
           //      legendItem.className = 'legend-item';
     //            legendItem.innerHTML = `
                //     <div class="player-avatar" style="background-color: ${jugador.color}; width: 30px; height: 30px; font-size: 16px;">
               //          ${jugador.avatarBase}
                 //    </div>
                 //    <span style="font-weight: bold;">${jugador.nombre}</span>
                  //   <span style="font-size: 12px; color: #666; margin-left: 10px;">
                //         ${jugador.avatarMalo}≤7 | ${jugador.avatarBase}8-11 | ${jugador.avatarBueno}12-13 | ${jugador.avatarPerfecto}≥14
                 //    </span>
             //    `;
           //      legendContainer.appendChild(legendItem);
          //   });
     //    }

        // Crear tarjetas de estadísticas
       // ...existing code...
function createStatsCards() {
    const statsContainer = document.getElementById('statsGrid');
    statsContainer.innerHTML = '';

    // Ordenar jugadores por total de aciertos (de mayor a menor)
    const jugadoresOrdenados = [...quinielaData.jugadores].sort((a, b) => {
        const totalA = a.aciertos.reduce((x, y) => x + y, 0);
        const totalB = b.aciertos.reduce((x, y) => x + y, 0);
        return totalB - totalA;
    });

    jugadoresOrdenados.forEach(jugador => {
        const totalAciertos = jugador.aciertos.reduce((a, b) => a + b, 0);
        const mediaAciertos = (totalAciertos / jugador.aciertos.length).toFixed(1);
        const maxAciertos = Math.max(...jugador.aciertos);
        const minAciertos = Math.min(...jugador.aciertos);

        // Avatar según la media
        const avatarMedia = getAvatarForScore(jugador, parseFloat(mediaAciertos));
        let avatarHtml;
        if (typeof avatarMedia === "string" && avatarMedia.match(/\.(png|jpg|jpeg|gif)$/i)) {
            avatarHtml = `<img src="${avatarMedia}" alt="avatar" style="width:100%;height:100%;border-radius:50%;">`;
        } else {
            avatarHtml = avatarMedia;
        }

        // Avatar mejor
        const avatarMejor = getAvatarForScore(jugador, maxAciertos);
        let avatarMejorHtml;
        if (typeof avatarMejor === "string" && avatarMejor.match(/\.(png|jpg|jpeg|gif)$/i)) {
            avatarMejorHtml = `<img src="${avatarMejor}" alt="mejor" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;">`;
        } else {
            avatarMejorHtml = avatarMejor;
        }

        // Avatar peor
        const avatarPeor = getAvatarForScore(jugador, minAciertos);
        let avatarPeorHtml;
        if (typeof avatarPeor === "string" && avatarPeor.match(/\.(png|jpg|jpeg|gif)$/i)) {
            avatarPeorHtml = `<img src="${avatarPeor}" alt="peor" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;">`;
        } else {
            avatarPeorHtml = avatarPeor;
        }

        const card = document.createElement('div');
        card.className = 'player-card';
        card.style.borderColor = jugador.color + '40';

        card.innerHTML = `
            <div class="player-avatar" style="background-color: ${jugador.color};">
                ${avatarHtml}
            </div>
            <div class="player-name">${jugador.nombre}</div>
            <div class="player-stats">
                <strong>Total:</strong> ${totalAciertos} aciertos<br>
                <strong>Media:</strong> ${mediaAciertos}<br>
                <strong>Mejor:</strong> ${maxAciertos} ${avatarMejorHtml} | <strong>Peor:</strong> ${minAciertos} ${avatarPeorHtml}
            </div>
        `;

        statsContainer.appendChild(card);
    });
}
// ...existing code...

        // Función para añadir jornada
        function addJornada() {
            const nuevosAciertos = prompt("Introduce los aciertos de la nueva jornada separados por comas\n(en el orden: " + 
                quinielaData.jugadores.map(j => j.nombre).join(", ") + "):");
            
            if (nuevosAciertos) {
                const aciertos = nuevosAciertos.split(",").map(a => parseInt(a.trim()));
                
                if (aciertos.length === quinielaData.jugadores.length && aciertos.every(a => !isNaN(a))) {
                    quinielaData.jugadores.forEach((jugador, index) => {
                        jugador.aciertos.push(aciertos[index]);
                    });
                    
                    updateChart();
                } else {
                    alert("Error: Debes introducir " + quinielaData.jugadores.length + " números válidos");
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
            chart.resetZoom();
        }

        // Actualizar todo el gráfico
        function updateChart() {
            createChart();
          //  createLegend();
            createStatsCards();
        }

        // Inicializar cuando carga la página
        window.onload = function() {
            updateChart();
        };