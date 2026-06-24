let db;
let dbInitialized = false;
let editor;
let chartCarreras, chartPromedios;
let history = [];
let diagramFullView = false;

// ===== INICIALIZAR CODEMIRROR =====
function initEditor() {
    const textarea = document.getElementById('sqlEditor');
    editor = CodeMirror.fromTextArea(textarea, {
        mode: 'text/x-sql',
        theme: 'monokai',
        lineNumbers: true,
        indentWithTabs: true,
        indentUnit: 4,
        matchBrackets: true,
        autoCloseBrackets: true
    });
    editor.setSize(null, '180px');
    
    editor.setOption('extraKeys', {
        'Ctrl-Enter': function() {
            runQuery();
        },
        'Ctrl-L': function() {
            clearEditor();
        }
    });
}

// ===== LIMPIAR EDITOR =====
function clearEditor() {
    if (editor.getValue().trim() !== '') {
        editor.setValue('');
        editor.focus();
        document.getElementById('resultOutput').innerHTML = '🧹 Editor limpiado';
    }
}

// ===== INICIALIZAR BASE DE DATOS =====
function initDatabase() {
    initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
    }).then(SQL => {
        db = new SQL.Database();
        
        // Tabla: estudiantes
        db.run(`
            CREATE TABLE estudiantes (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                edad INTEGER,
                carrera TEXT,
                promedio REAL
            )
        `);
        
        db.run(`
            INSERT INTO estudiantes VALUES 
                (1, 'Ana García', 20, 'Ingeniería', 8.5),
                (2, 'Carlos López', 22, 'Medicina', 9.2),
                (3, 'María Torres', 19, 'Derecho', 7.8),
                (4, 'Juan Pérez', 21, 'Arquitectura', 8.9),
                (5, 'Laura Sánchez', 20, 'Ingeniería', 9.5)
        `);
        
        // Tabla: cursos
        db.run(`
            CREATE TABLE cursos (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                creditos INTEGER,
                profesor TEXT
            )
        `);
        
        db.run(`
            INSERT INTO cursos VALUES 
                (1, 'Matemáticas', 4, 'Dr. Ramírez'),
                (2, 'Programación', 6, 'Dra. Martínez'),
                (3, 'Física', 3, 'Dr. Gómez'),
                (4, 'Química', 4, 'Dra. Fernández')
        `);
        
        // Tabla: inscripciones
        db.run(`
            CREATE TABLE inscripciones (
                estudiante_id INTEGER,
                curso_id INTEGER,
                año INTEGER,
                FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
                FOREIGN KEY (curso_id) REFERENCES cursos(id)
            )
        `);
        
        db.run(`
            INSERT INTO inscripciones VALUES 
                (1, 1, 2025),
                (1, 2, 2025),
                (2, 3, 2025),
                (3, 2, 2025),
                (4, 1, 2025),
                (4, 4, 2025),
                (5, 2, 2025),
                (5, 3, 2025)
        `);
        
        dbInitialized = true;
        showTablesInfo();
        loadTableEditor();
        updateCharts();
        generateDiagram();
        document.getElementById('resultOutput').innerHTML = '✅ Base de datos lista. ¡Escribe una consulta SQL!';
    }).catch(error => {
        document.getElementById('resultOutput').innerHTML = `❌ Error al cargar SQL.js: ${error.message}`;
    });
}

// ===== MOSTRAR INFO DE TABLAS =====
function showTablesInfo() {
    if (!db) return;
    try {
        const tables = ['estudiantes', 'cursos', 'inscripciones'];
        let html = '';
        
        tables.forEach(tableName => {
            const result = db.exec(`SELECT * FROM ${tableName} LIMIT 5`);
            if (result.length > 0) {
                const cols = result[0].columns;
                const rows = result[0].values;
                
                const countResult = db.exec(`SELECT COUNT(*) as total FROM ${tableName}`);
                const totalRows = countResult.length > 0 ? countResult[0].values[0][0] : 0;
                
                html += `<div class="table-card">`;
                html += `<div class="table-title">📋 ${tableName} <span class="badge">${totalRows} registros</span></div>`;
                html += `<div class="table-scroll">`;
                html += `<table class="info-table">`;
                
                html += '<thead><tr>';
                cols.forEach(col => {
                    html += `<th>${col}</th>`;
                });
                html += '</tr></thead>';
                
                html += '<tbody>';
                if (rows.length === 0) {
                    html += `<tr><td colspan="${cols.length}" style="text-align:center;color:#999;">Sin datos</td></tr>`;
                } else {
                    rows.forEach(row => {
                        html += '<tr>';
                        row.forEach(val => {
                            html += `<td>${val !== null ? val : 'NULL'}</td>`;
                        });
                        html += '</tr>';
                    });
                    if (totalRows > 5) {
                        html += `<tr><td colspan="${cols.length}" style="text-align:center;color:#999;font-style:italic;">
                            ... y ${totalRows - 5} registros más
                        </td></tr>`;
                    }
                }
                
                html += '</tbody></table>';
                html += '</div></div>';
            }
        });
        
        document.getElementById('tableInfo').innerHTML = html || '<p>No hay tablas disponibles</p>';
    } catch(e) {
        document.getElementById('tableInfo').innerHTML = `<p style="color:#dc3545;">❌ Error: ${e.message}</p>`;
    }
}

// ===== EJECUTAR CONSULTA =====
function runQuery() {
    if (!dbInitialized) {
        document.getElementById('resultOutput').innerHTML = '⏳ Esperando que la base de datos se inicialice...';
        return;
    }
    
    const query = editor.getValue().trim();
    
    if (!query) {
        document.getElementById('resultOutput').innerHTML = '⚠️ Por favor, escribe una consulta SQL';
        return;
    }
    
    addToHistory(query);
    
    try {
        const result = db.exec(query);
        
        if (result.length === 0) {
            document.getElementById('resultOutput').innerHTML = '✅ Consulta ejecutada correctamente.';
            showTablesInfo();
            loadTableEditor();
            updateCharts();
            generateDiagram();
            return;
        }
        
        let html = `<div style="font-size:0.9em;color:#666;margin-bottom:10px;">
            📊 ${result[0].values.length} filas encontradas
        </div>`;
        html += '<table>';
        
        html += '<tr>';
        result[0].columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '</tr>';
        
        result[0].values.forEach(row => {
            html += '<tr>';
            row.forEach(value => {
                html += `<td>${value !== null ? value : 'NULL'}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</table>';
        document.getElementById('resultOutput').innerHTML = html;
        
    } catch(error) {
        document.getElementById('resultOutput').innerHTML = `
            <div style="color:#dc3545;">
                ❌ Error en la consulta:<br>
                <code>${error.message}</code>
            </div>
        `;
    }
}

// ===== HISTORIAL =====
function addToHistory(query) {
    if (!query || query.trim() === '') return;
    if (history.includes(query)) return;
    history.unshift(query);
    if (history.length > 20) history.pop();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const list = document.getElementById('historyList');
    if (history.length === 0) {
        list.innerHTML = '<li style="color:#999;border-left-color:#999;">No hay consultas aún</li>';
        return;
    }
    list.innerHTML = history.map(query => 
        `<li onclick="loadHistoryQuery('${query.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')">${query}</li>`
    ).join('');
}

function loadHistoryQuery(query) {
    editor.setValue(query);
    editor.focus();
}

function clearHistory() {
    if (confirm('¿Limpiar todo el historial?')) {
        history = [];
        updateHistoryDisplay();
    }
}

// ===== EXPORTAR/IMPORTAR =====
function exportDatabase() {
    if (!db) return;
    const data = db.export();
    const blob = new Blob([data], {type: 'application/x-sqlite3'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_${new Date().toISOString().slice(0,10)}.sqlite`;
    a.click();
    URL.revokeObjectURL(url);
}

function importDatabase(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!confirm('¿Importar esta base de datos? Se perderán los cambios actuales.')) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        const byteArray = new Uint8Array(arrayBuffer);
        initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` }).then(SQL => {
            db = new SQL.Database(byteArray);
            dbInitialized = true;
            showTablesInfo();
            loadTableEditor();
            updateCharts();
            generateDiagram();
            document.getElementById('resultOutput').innerHTML = '✅ Base de datos importada correctamente.';
            event.target.value = '';
        }).catch(error => {
            document.getElementById('resultOutput').innerHTML = `❌ Error al importar: ${error.message}`;
        });
    };
    reader.readAsArrayBuffer(file);
}

// ===== EDITOR DE TABLAS =====
function loadTableEditor() {
    if (!db) return;
    const tableName = document.getElementById('tableSelector').value;
    const content = document.getElementById('tableEditorContent');
    
    try {
        const result = db.exec(`SELECT * FROM ${tableName}`);
        if (result.length === 0) {
            content.innerHTML = '<p style="color:#999;">Tabla vacía</p>';
            return;
        }
        
        let html = '<table>';
        html += '<thead><tr>';
        result[0].columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '<th>Acciones</th></tr></thead>';
        
        html += '<tbody>';
        result[0].values.forEach((row, idx) => {
            html += `<tr>`;
            row.forEach((value, colIdx) => {
                html += `<td><input type="text" value="${value}" data-row="${idx}" data-col="${colIdx}" class="cell-input" /></td>`;
            });
            html += `<td><button onclick="deleteRow('${tableName}', ${row[0]})" class="delete-btn">🗑️</button></td>`;
            html += '</tr>';
        });
        html += '</tbody></table>';
        content.innerHTML = html;
    } catch(e) {
        content.innerHTML = `Error: ${e.message}`;
    }
}

function saveTableChanges(tableName) {
    if (!db) return;
    
    try {
        const inputs = document.querySelectorAll('#tableEditorContent .cell-input');
        
        const tableInfo = db.exec(`PRAGMA table_info(${tableName})`);
        if (tableInfo.length === 0) {
            document.getElementById('resultOutput').innerHTML = '❌ Error: No se pudo obtener la estructura de la tabla';
            return;
        }
        
        const columns = tableInfo[0].values.map(v => v[1]);
        
        const rowData = {};
        inputs.forEach(input => {
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            const value = input.value;
            
            if (!rowData[row]) rowData[row] = {};
            rowData[row][col] = value;
        });
        
        for (const rowIndex in rowData) {
            const data = rowData[rowIndex];
            const id = data[0];
            
            const setClauses = [];
            
            for (let colIndex = 1; colIndex < columns.length; colIndex++) {
                const colName = columns[colIndex];
                const value = data[colIndex];
                
                const isNumber = !isNaN(value) && value !== '' && value !== null;
                const isNull = value === '' || value === null || value === 'NULL';
                
                if (isNull) {
                    setClauses.push(`${colName} = NULL`);
                } else if (isNumber) {
                    setClauses.push(`${colName} = ${value}`);
                } else {
                    setClauses.push(`${colName} = '${value.replace(/'/g, "''")}'`);
                }
            }
            
            if (setClauses.length > 0) {
                const sql = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = ${id}`;
                db.run(sql);
            }
        }
        
        loadTableEditor();
        showTablesInfo();
        updateCharts();
        generateDiagram();
        document.getElementById('resultOutput').innerHTML = `✅ Cambios guardados correctamente en la tabla ${tableName}`;
        
    } catch(e) {
        document.getElementById('resultOutput').innerHTML = `❌ Error al guardar cambios: ${e.message}`;
        console.error(e);
    }
}

function deleteRow(tableName, id) {
    if (!confirm(`¿Eliminar registro con ID ${id}?`)) return;
    try {
        db.run(`DELETE FROM ${tableName} WHERE id = ${id}`);
        loadTableEditor();
        showTablesInfo();
        updateCharts();
        generateDiagram();
        document.getElementById('resultOutput').innerHTML = `✅ Registro eliminado correctamente.`;
    } catch(e) {
        document.getElementById('resultOutput').innerHTML = `❌ Error al eliminar: ${e.message}`;
    }
}

function addRow(tableName) {
    if (!db) return;
    try {
        const result = db.exec(`PRAGMA table_info(${tableName})`);
        if (result.length === 0) return;
        
        const columns = result[0].values.map(v => v[1]);
        const columnsWithoutId = columns.filter(c => c !== 'id');
        
        const placeholders = columnsWithoutId.map(() => '?').join(',');
        const values = columnsWithoutId.map(col => {
            if (col === 'nombre') return 'Nuevo registro';
            if (col === 'edad' || col === 'creditos' || col === 'año') return 0;
            if (col === 'promedio') return 0.0;
            return 'texto';
        });
        
        db.run(`INSERT INTO ${tableName} (${columnsWithoutId.join(',')}) VALUES (${placeholders})`, values);
        loadTableEditor();
        showTablesInfo();
        updateCharts();
        generateDiagram();
        document.getElementById('resultOutput').innerHTML = `✅ Nueva fila agregada a ${tableName}`;
    } catch(e) {
        document.getElementById('resultOutput').innerHTML = `❌ Error al agregar fila: ${e.message}`;
    }
}

// ===== DIAGRAMA DE RELACIONES =====
function generateDiagram() {
    if (!db) {
        document.getElementById('diagramContainer').innerHTML = 
            '<p style="color:#dc3545;">❌ Base de datos no inicializada</p>';
        return;
    }
    
    try {
        const container = document.getElementById('diagramContainer');
        
        // Definir las entidades y sus atributos
        const entities = {
            'estudiantes': {
                columns: ['id', 'nombre', 'edad', 'carrera', 'promedio'],
                primaryKey: 'id',
                foreignKeys: [],
                label: 'Estudiantes'
            },
            'cursos': {
                columns: ['id', 'nombre', 'creditos', 'profesor'],
                primaryKey: 'id',
                foreignKeys: [],
                label: 'Cursos'
            },
            'inscripciones': {
                columns: ['estudiante_id', 'curso_id', 'año'],
                primaryKey: null,
                foreignKeys: ['estudiante_id', 'curso_id'],
                label: 'Inscripciones'
            }
        };
        
        let html = '<div class="diagram-erd">';
        
        const entityNames = Object.keys(entities);
        entityNames.forEach((name, index) => {
            const info = entities[name];
            
            html += `<div class="entity-box">`;
            html += `<div class="entity-title">📋 ${info.label}</div>`;
            html += `<ul>`;
            
            info.columns.forEach(col => {
                let className = '';
                let displayCol = col;
                
                if (col === info.primaryKey && info.foreignKeys.includes(col)) {
                    className = 'pk-fk';
                    displayCol = col;
                } else if (col === info.primaryKey) {
                    className = 'pk';
                    displayCol = col;
                } else if (info.foreignKeys.includes(col)) {
                    className = 'fk';
                    displayCol = col;
                }
                
                html += `<li class="${className}">${displayCol}</li>`;
            });
            
            html += `</ul></div>`;
            
            // Agregar relación entre entidades
            if (index < entityNames.length - 1) {
                const currentName = name;
                const nextName = entityNames[index + 1];
                
                // Determinar el tipo de relación
                let relationLabel = '';
                let relationSymbol = '⟷';
                
                if (currentName === 'estudiantes' && nextName === 'inscripciones') {
                    relationLabel = '1 : N';
                    relationSymbol = '───';
                } else if (currentName === 'cursos' && nextName === 'inscripciones') {
                    relationLabel = '1 : N';
                    relationSymbol = '───';
                } else if (currentName === 'inscripciones' && nextName === 'estudiantes') {
                    relationLabel = 'N : 1';
                    relationSymbol = '───';
                } else {
                    relationLabel = '⟷';
                    relationSymbol = '───';
                }
                
                html += `<div class="relation-group">`;
                html += `<div class="relation-line">${relationSymbol}</div>`;
                html += `<div class="relation-label">${relationLabel}</div>`;
                html += `</div>`;
            }
        });
        
        html += '</div>';
        
        // Leyenda
        html += `
            <div style="display:flex; justify-content:center; gap:20px; margin-top:15px; flex-wrap:wrap; font-size:12px; color:#666; border-top:1px solid #e9ecef; padding-top:15px;">
                <span><span style="color:#667eea; font-weight:bold;">🔑</span> Primary Key</span>
                <span><span style="color:#764ba2; font-weight:bold;">🔗</span> Foreign Key</span>
                <span><span style="color:#dc3545; font-weight:bold;">🔑🔗</span> Primary + Foreign Key</span>
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch(e) {
        document.getElementById('diagramContainer').innerHTML = 
            `<p style="color:#dc3545;">❌ Error al generar diagrama: ${e.message}</p>`;
        document.getElementById('resultOutput').innerHTML = `❌ Error: ${e.message}`;
    }
}

function toggleDiagramView() {
    const container = document.getElementById('diagramContainer');
    const overlay = document.getElementById('diagramOverlay') || createOverlay();
    const closeBtn = document.getElementById('closeDiagramBtn') || createCloseButton();
    
    diagramFullView = !diagramFullView;
    
    if (diagramFullView) {
        container.classList.add('full-view');
        overlay.classList.add('active');
        closeBtn.classList.add('visible');
    } else {
        container.classList.remove('full-view');
        overlay.classList.remove('active');
        closeBtn.classList.remove('visible');
    }
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'diagramOverlay';
    overlay.className = 'diagram-overlay';
    overlay.onclick = toggleDiagramView;
    document.body.appendChild(overlay);
    return overlay;
}

function createCloseButton() {
    const btn = document.createElement('button');
    btn.id = 'closeDiagramBtn';
    btn.className = 'close-diagram-btn';
    btn.innerHTML = '✕';
    btn.onclick = toggleDiagramView;
    document.body.appendChild(btn);
    return btn;
}

// ===== GRÁFICOS =====
function updateCharts() {
    if (!db) return;
    
    try {
        const resultCarreras = db.exec(`SELECT carrera, COUNT(*) as cantidad FROM estudiantes GROUP BY carrera`);
        if (resultCarreras.length > 0 && resultCarreras[0].values.length > 0) {
            const labels = resultCarreras[0].values.map(row => row[0]);
            const data = resultCarreras[0].values.map(row => row[1]);
            const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#a18cd1'];
            
            if (chartCarreras) chartCarreras.destroy();
            
            const ctx = document.getElementById('chartCarreras').getContext('2d');
            chartCarreras = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Estudiantes por carrera',
                        data: data,
                        backgroundColor: colors.slice(0, data.length),
                        borderColor: colors.slice(0, data.length).map(c => c + 'cc'),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Estudiantes por Carrera'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    }
                }
            });
        }
    } catch(e) {
        console.log('Error en gráfico de carreras:', e);
    }
    
    try {
        const resultPromedios = db.exec(`SELECT carrera, ROUND(AVG(promedio), 2) as promedio FROM estudiantes GROUP BY carrera`);
        if (resultPromedios.length > 0 && resultPromedios[0].values.length > 0) {
            const labels = resultPromedios[0].values.map(row => row[0]);
            const data = resultPromedios[0].values.map(row => row[1]);
            
            if (chartPromedios) chartPromedios.destroy();
            
            const ctx = document.getElementById('chartPromedios').getContext('2d');
            chartPromedios = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Promedio por carrera',
                        data: data,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#764ba2',
                        pointBorderColor: '#764ba2',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Promedio por Carrera'
                        }
                    },
                    scales: {
                        y: {
                            min: 0,
                            max: 10,
                            title: {
                                display: true,
                                text: 'Promedio'
                            }
                        }
                    }
                }
            });
        }
    } catch(e) {
        console.log('Error en gráfico de promedios:', e);
    }
}

// ===== REINICIAR BASE DE DATOS =====
function resetDatabase() {
    if (confirm('¿Seguro que quieres reiniciar la base de datos a su estado original?')) {
        dbInitialized = false;
        document.getElementById('resultOutput').innerHTML = '⏳ Reiniciando base de datos...';
        initDatabase();
    }
}

// ===== MOSTRAR EJEMPLOS =====
function showExamples() {
    const examples = [
        "-- Todos los estudiantes\nSELECT * FROM estudiantes;",
        "-- Estudiantes de Ingeniería\nSELECT * FROM estudiantes WHERE carrera = 'Ingeniería';",
        "-- Ordenar por promedio\nSELECT * FROM estudiantes ORDER BY promedio DESC;",
        "-- Consulta con JOIN\nSELECT e.nombre, c.nombre, c.creditos \nFROM estudiantes e\nJOIN inscripciones i ON e.id = i.estudiante_id\nJOIN cursos c ON i.curso_id = c.id\nWHERE e.carrera = 'Ingeniería';",
        "-- Promedio de edad por carrera\nSELECT carrera, AVG(edad) as edad_promedio \nFROM estudiantes \nGROUP BY carrera;",
        "-- Estudiantes con mejor promedio\nSELECT * FROM estudiantes WHERE promedio > (SELECT AVG(promedio) FROM estudiantes);",
        "-- Contar estudiantes por carrera\nSELECT carrera, COUNT(*) as cantidad \nFROM estudiantes \nGROUP BY carrera;",
        "-- Cursos y sus inscritos\nSELECT c.nombre, COUNT(i.estudiante_id) as inscritos \nFROM cursos c\nLEFT JOIN inscripciones i ON c.id = i.curso_id\nGROUP BY c.nombre;"
    ];
    
    const currentExample = examples[Math.floor(Math.random() * examples.length)];
    editor.setValue(currentExample);
    editor.focus();
}

// ===== ATAJOS DE TECLADO =====
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        resetDatabase();
    }
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        showExamples();
    }
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearEditor();
    }
    if (e.key === 'Escape' && document.activeElement === document.querySelector('.CodeMirror')) {
        clearEditor();
    }
});

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', function() {
    initEditor();
    initDatabase();
});

// ===== AÑO AUTOMÁTICO EN EL FOOTER =====
document.addEventListener('DOMContentLoaded', function() {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// Exponer funciones globalmente
window.runQuery = runQuery;
window.resetDatabase = resetDatabase;
window.showExamples = showExamples;
window.clearHistory = clearHistory;
window.loadHistoryQuery = loadHistoryQuery;
window.exportDatabase = exportDatabase;
window.importDatabase = importDatabase;
window.loadTableEditor = loadTableEditor;
window.deleteRow = deleteRow;
window.addRow = addRow;
window.updateCharts = updateCharts;
window.clearEditor = clearEditor;
window.saveTableChanges = saveTableChanges;
window.generateDiagram = generateDiagram;
window.toggleDiagramView = toggleDiagramView;