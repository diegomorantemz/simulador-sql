let db;
let dbInitialized = false;
let chartCarreras, chartPromedios;
let history = [];
let diagramFullView = false;

// ===== LIMPIAR EDITOR =====
function clearEditor() {
    const editor = document.getElementById('sqlEditor');
    if (editor.value.trim() !== '') {
        editor.value = '';
        editor.focus();
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:20px;text-align:center;color:#f59e0b;background:#fffbeb;border-radius:8px;">
                🧹 Editor limpiado
            </div>
        `;
    }
}

// ===== INICIALIZAR BASE DE DATOS CON MÁS DATOS =====
function initDatabase() {
    initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
    }).then(SQL => {
        db = new SQL.Database();
        
        // ===== TABLA: ESTUDIANTES (25 estudiantes) =====
        db.run(`
            CREATE TABLE estudiantes (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                edad INTEGER,
                carrera TEXT,
                promedio REAL,
                ciudad TEXT,
                fecha_ingreso TEXT
            )
        `);
        
        db.run(`
            INSERT INTO estudiantes VALUES 
                (1, 'Ana García', 20, 'Ingeniería', 15.5, 'Lima', '2023-03-15'),
                (2, 'Carlos López', 22, 'Medicina', 17.2, 'Arequipa', '2022-02-10'),
                (3, 'María Torres', 19, 'Derecho', 12.8, 'Cusco', '2024-01-20'),
                (4, 'Juan Pérez', 21, 'Arquitectura', 16.9, 'Lima', '2023-04-05'),
                (5, 'Laura Sánchez', 20, 'Ingeniería', 18.5, 'Trujillo', '2023-03-01'),
                (6, 'Pedro Díaz', 23, 'Ingeniería', 14.2, 'Lima', '2022-01-15'),
                (7, 'Sofía Romero', 21, 'Medicina', 17.1, 'Arequipa', '2023-02-20'),
                (8, 'Diego Luna', 22, 'Arquitectura', 13.9, 'Cusco', '2022-06-10'),
                (9, 'Valentina Ríos', 19, 'Derecho', 15.7, 'Lima', '2024-02-14'),
                (10, 'Mateo Cruz', 24, 'Ingeniería', 16.0, 'Trujillo', '2021-08-01'),
                (11, 'Camila Vega', 20, 'Medicina', 15.8, 'Lima', '2023-09-15'),
                (12, 'Lucas Fernández', 22, 'Arquitectura', 14.1, 'Arequipa', '2022-11-20'),
                (13, 'Isabella Ortiz', 19, 'Derecho', 17.3, 'Cusco', '2024-01-10'),
                (14, 'Gabriel Silva', 21, 'Ingeniería', 13.6, 'Lima', '2023-05-22'),
                (15, 'Valeria Mendoza', 23, 'Medicina', 18.4, 'Trujillo', '2022-04-18'),
                (16, 'Daniel Castro', 20, 'Arquitectura', 15.4, 'Lima', '2023-07-07'),
                (17, 'Lucía Herrera', 22, 'Derecho', 14.0, 'Arequipa', '2022-09-30'),
                (18, 'Tomás Gutiérrez', 19, 'Ingeniería', 17.1, 'Cusco', '2024-03-25'),
                (19, 'Paula Morales', 21, 'Medicina', 13.5, 'Lima', '2023-10-12'),
                (20, 'Joaquín Nuñez', 24, 'Arquitectura', 16.9, 'Trujillo', '2021-12-01'),
                (21, 'Martina Flores', 20, 'Ingeniería', 17.2, 'Lima', '2023-06-15'),
                (22, 'Sebastián Peña', 22, 'Derecho', 15.6, 'Arequipa', '2022-07-20'),
                (23, 'Renata Cabrera', 19, 'Medicina', 16.0, 'Cusco', '2024-02-28'),
                (24, 'Emiliano Reyes', 21, 'Arquitectura', 13.7, 'Lima', '2023-08-14'),
                (25, 'Antonella Figueroa', 23, 'Ingeniería', 15.8, 'Trujillo', '2022-05-06')
        `);
        
        // ===== TABLA: CURSOS (15 cursos) =====
        db.run(`
            CREATE TABLE cursos (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                creditos INTEGER,
                profesor TEXT,
                departamento TEXT,
                semestre INTEGER
            )
        `);
        
        db.run(`
            INSERT INTO cursos VALUES 
                (1, 'Matemáticas I', 4, 'Dr. Ramírez', 'Ciencias', 1),
                (2, 'Programación I', 6, 'Dra. Martínez', 'Ingeniería', 1),
                (3, 'Física I', 3, 'Dr. Gómez', 'Ciencias', 1),
                (4, 'Química I', 4, 'Dra. Fernández', 'Ciencias', 1),
                (5, 'Matemáticas II', 4, 'Dr. Ramírez', 'Ciencias', 2),
                (6, 'Programación II', 6, 'Dra. Martínez', 'Ingeniería', 2),
                (7, 'Física II', 3, 'Dr. Gómez', 'Ciencias', 2),
                (8, 'Química II', 4, 'Dra. Fernández', 'Ciencias', 2),
                (9, 'Base de Datos', 5, 'Dr. Torres', 'Ingeniería', 3),
                (10, 'Redes', 4, 'Dra. Castro', 'Ingeniería', 3),
                (11, 'Algoritmos', 6, 'Dr. Mendoza', 'Ingeniería', 3),
                (12, 'Gestión de Proyectos', 4, 'Dra. Ortega', 'Administración', 4),
                (13, 'Marketing Digital', 3, 'Dr. Silva', 'Administración', 4),
                (14, 'Finanzas', 4, 'Dra. Paz', 'Administración', 4),
                (15, 'Ingeniería de Software', 5, 'Dr. Torres', 'Ingeniería', 4)
        `);
        
        // ===== TABLA: INSCRIPCIONES (70 inscripciones) =====
        db.run(`
            CREATE TABLE inscripciones (
                id INTEGER PRIMARY KEY,
                estudiante_id INTEGER,
                curso_id INTEGER,
                año INTEGER,
                ciclo TEXT,
                nota REAL,
                FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
                FOREIGN KEY (curso_id) REFERENCES cursos(id)
            )
        `);
        
        db.run(`
            INSERT INTO inscripciones VALUES 
                (1, 1, 1, 2023, '2023-1', 15.5),
                (2, 1, 2, 2023, '2023-1', 17.0),
                (3, 1, 3, 2023, '2023-1', 14.0),
                (4, 2, 3, 2023, '2023-1', 18.5),
                (5, 2, 4, 2023, '2023-1', 16.0),
                (6, 3, 2, 2023, '2023-1', 12.5),
                (7, 3, 9, 2023, '2023-1', 11.0),
                (8, 4, 1, 2023, '2023-1', 17.5),
                (9, 4, 5, 2023, '2023-1', 16.0),
                (10, 5, 2, 2023, '2023-1', 19.0),
                (11, 5, 6, 2023, '2023-1', 18.0),
                (12, 5, 10, 2023, '2023-1', 16.5),
                (13, 6, 1, 2023, '2023-1', 13.0),
                (14, 6, 5, 2023, '2023-1', 14.5),
                (15, 6, 9, 2023, '2023-1', 12.0),
                (16, 7, 4, 2023, '2023-1', 17.0),
                (17, 7, 7, 2023, '2023-1', 15.5),
                (18, 8, 1, 2023, '2023-1', 14.0),
                (19, 8, 5, 2023, '2023-1', 13.5),
                (20, 9, 2, 2023, '2023-1', 16.5),
                (21, 9, 13, 2023, '2023-1', 14.0),
                (22, 10, 2, 2023, '2023-1', 18.0),
                (23, 10, 6, 2023, '2023-1', 17.5),
                (24, 10, 11, 2023, '2023-1', 16.0),
                (25, 11, 3, 2023, '2023-1', 15.0),
                (26, 11, 7, 2023, '2023-1', 14.5),
                (27, 12, 1, 2023, '2023-1', 12.0),
                (28, 12, 5, 2023, '2023-1', 13.0),
                (29, 13, 9, 2023, '2023-1', 18.5),
                (30, 13, 13, 2023, '2023-1', 16.0),
                (31, 14, 2, 2023, '2023-1', 14.0),
                (32, 14, 6, 2023, '2023-1', 15.5),
                (33, 15, 4, 2023, '2023-1', 19.0),
                (34, 15, 8, 2023, '2023-1', 17.0),
                (35, 15, 12, 2023, '2023-1', 16.5),
                (36, 16, 1, 2023, '2023-1', 15.0),
                (37, 16, 5, 2023, '2023-1', 14.0),
                (38, 17, 9, 2023, '2023-1', 13.0),
                (39, 17, 14, 2023, '2023-1', 12.5),
                (40, 18, 2, 2023, '2023-1', 18.0),
                (41, 18, 6, 2023, '2023-1', 17.0),
                (42, 18, 10, 2023, '2023-1', 15.5),
                (43, 19, 3, 2023, '2023-1', 14.0),
                (44, 19, 7, 2023, '2023-1', 13.5),
                (45, 20, 1, 2023, '2023-1', 16.0),
                (46, 20, 5, 2023, '2023-1', 15.0),
                (47, 20, 11, 2023, '2023-1', 17.5),
                (48, 21, 2, 2023, '2023-1', 18.5),
                (49, 21, 6, 2023, '2023-1', 17.0),
                (50, 21, 9, 2023, '2023-1', 16.0),
                (51, 22, 4, 2023, '2023-1', 15.5),
                (52, 22, 8, 2023, '2023-1', 14.0),
                (53, 22, 13, 2023, '2023-1', 13.5),
                (54, 23, 3, 2023, '2023-1', 17.0),
                (55, 23, 7, 2023, '2023-1', 16.5),
                (56, 24, 1, 2023, '2023-1', 14.5),
                (57, 24, 5, 2023, '2023-1', 13.0),
                (58, 24, 12, 2023, '2023-1', 12.0),
                (59, 25, 2, 2023, '2023-1', 16.5),
                (60, 25, 6, 2023, '2023-1', 15.0),
                (61, 25, 15, 2023, '2023-1', 18.0),
                (62, 1, 5, 2024, '2024-1', 16.0),
                (63, 2, 2, 2024, '2024-1', 17.5),
                (64, 5, 9, 2024, '2024-1', 18.5),
                (65, 7, 12, 2024, '2024-1', 15.0),
                (66, 10, 15, 2024, '2024-1', 17.0),
                (67, 15, 13, 2024, '2024-1', 16.5),
                (68, 18, 14, 2024, '2024-1', 14.0),
                (69, 21, 10, 2024, '2024-1', 16.0),
                (70, 25, 11, 2024, '2024-1', 17.5)
        `);
        
        dbInitialized = true;
        showTablesInfo();
        loadTableEditor();
        updateCharts();
        generateDiagram();
        
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:20px;text-align:center;color:#28a745;background:#f0fff4;border-radius:8px;">
                ✅ Base de datos lista. ¡Escribe una consulta SQL!
            </div>
        `;
    }).catch(error => {
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:15px;background:#fff5f5;border-radius:8px;border-left:4px solid #dc3545;">
                <div style="color:#dc3545;font-weight:600;">❌ Error al cargar SQL.js</div>
                <code style="display:block;padding:10px;background:white;border-radius:6px;font-size:13px;margin-top:5px;">${error.message}</code>
            </div>
        `;
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
                            const displayVal = val !== null ? String(val) : 'NULL';
                            const truncated = displayVal.length > 20 ? displayVal.substring(0, 20) + '...' : displayVal;
                            html += `<td title="${displayVal}">${truncated}</td>`;
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
        
        document.getElementById('tableInfo').innerHTML = html || '<p class="text-muted">No hay tablas disponibles</p>';
    } catch(e) {
        document.getElementById('tableInfo').innerHTML = `<p style="color:#dc3545;">❌ Error: ${e.message}</p>`;
    }
}

// ===== FUNCIÓN PARA MOSTRAR RESULTADOS CON SCROLL =====
function displayResults(result) {
    if (!result || result.length === 0) {
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:20px;text-align:center;color:#28a745;background:#f0fff4;border-radius:8px;">
                ✅ Consulta ejecutada correctamente
            </div>
        `;
        return;
    }
    
    const rowCount = result[0].values.length;
    const colCount = result[0].columns.length;
    
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px; padding:8px 12px; background:white; border-radius:8px; border:1px solid #e9ecef;">
            <span style="font-weight:600; color:#333;">
                📊 ${rowCount} ${rowCount === 1 ? 'fila' : 'filas'} encontradas | ${colCount} columnas
            </span>
            <span style="font-size:12px; color:#999;">
                💡 <strong>Desliza</strong> horizontal y verticalmente
            </span>
        </div>
        <div class="result-container">
            <table>
                <thead>
                    <tr>
                        ${result[0].columns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${result[0].values.map(row => `
                        <tr>
                            ${row.map(value => {
                                const displayValue = value !== null && value !== undefined ? String(value) : 'NULL';
                                const truncated = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;
                                return `<td title="${displayValue.replace(/"/g, '&quot;')}">${truncated}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top:8px; font-size:11px; color:#999; text-align:center; display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
            <span>⬅️➡️ Scroll horizontal</span>
            <span>⬆️⬇️ Scroll vertical</span>
        </div>
    `;
    
    document.getElementById('resultOutput').innerHTML = html;
}

// ===== EJECUTAR CONSULTA =====
function runQuery() {
    if (!dbInitialized) {
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:20px;text-align:center;color:#999;background:#f8f9fa;border-radius:8px;">
                ⏳ Esperando que la base de datos se inicialice...
            </div>
        `;
        return;
    }
    
    const editor = document.getElementById('sqlEditor');
    const query = editor.value.trim();
    
    if (!query) {
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:20px;text-align:center;color:#f59e0b;background:#fffbeb;border-radius:8px;">
                ⚠️ Por favor, escribe una consulta SQL
            </div>
        `;
        return;
    }
    
    addToHistory(query);
    
    try {
        const result = db.exec(query);
        
        if (result.length === 0) {
            document.getElementById('resultOutput').innerHTML = `
                <div style="padding:20px;text-align:center;color:#28a745;background:#f0fff4;border-radius:8px;">
                    ✅ Consulta ejecutada correctamente
                </div>
            `;
            showTablesInfo();
            loadTableEditor();
            updateCharts();
            generateDiagram();
            return;
        }
        
        displayResults(result);
        showTablesInfo();
        loadTableEditor();
        updateCharts();
        generateDiagram();
        
    } catch(error) {
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:15px;background:#fff5f5;border-radius:8px;border-left:4px solid #dc3545;">
                <div style="color:#dc3545;font-weight:600;margin-bottom:5px;">❌ Error en la consulta</div>
                <code style="display:block;padding:10px;background:white;border-radius:6px;font-size:13px;color:#333;margin-top:5px;overflow:auto;white-space:pre-wrap;word-break:break-all;">
                    ${error.message}
                </code>
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
        list.innerHTML = '<li class="empty-history" style="color:#999;border-left-color:#999;">No hay consultas aún</li>';
        return;
    }
    list.innerHTML = history.map(query => {
        const truncated = query.length > 60 ? query.substring(0, 60) + '...' : query;
        return `<li onclick="loadHistoryQuery('${query.replace(/'/g, "\\'").replace(/"/g, '&quot;')}')" title="${query.replace(/"/g, '&quot;')}">${truncated}</li>`;
    }).join('');
}

function loadHistoryQuery(query) {
    const editor = document.getElementById('sqlEditor');
    editor.value = query;
    editor.focus();
}

function clearHistory() {
    if (confirm('¿Limpiar todo el historial?')) {
        history = [];
        updateHistoryDisplay();
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:20px;text-align:center;color:#999;background:#f8f9fa;border-radius:8px;">
                🗑️ Historial limpiado
            </div>
        `;
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
            document.getElementById('resultOutput').innerHTML = `
                <div style="padding:20px;text-align:center;color:#28a745;background:#f0fff4;border-radius:8px;">
                    ✅ Base de datos importada correctamente
                </div>
            `;
            event.target.value = '';
        }).catch(error => {
            document.getElementById('resultOutput').innerHTML = `
                <div style="padding:15px;background:#fff5f5;border-radius:8px;border-left:4px solid #dc3545;">
                    <div style="color:#dc3545;font-weight:600;">❌ Error al importar</div>
                    <code style="display:block;padding:10px;background:white;border-radius:6px;font-size:13px;margin-top:5px;">${error.message}</code>
                </div>
            `;
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
            content.innerHTML = '<p class="text-muted" style="text-align:center;padding:20px;">📭 Tabla vacía</p>';
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
                const displayValue = value !== null && value !== undefined ? value : '';
                html += `<td><input type="text" value="${displayValue}" data-row="${idx}" data-col="${colIdx}" class="cell-input" /></td>`;
            });
            html += `<td><button onclick="deleteRow('${tableName}', ${row[0]})" class="delete-btn">🗑️</button></td>`;
            html += '</tr>';
        });
        html += '</tbody></table>';
        content.innerHTML = html;
    } catch(e) {
        content.innerHTML = `<p style="color:#dc3545;">❌ Error: ${e.message}</p>`;
    }
}

function saveTableChanges(tableName) {
    if (!db) return;
    
    try {
        const inputs = document.querySelectorAll('#tableEditorContent .cell-input');
        
        const tableInfo = db.exec(`PRAGMA table_info(${tableName})`);
        if (tableInfo.length === 0) {
            document.getElementById('resultOutput').innerHTML = `
                <div style="padding:15px;background:#fff5f5;border-radius:8px;border-left:4px solid #dc3545;">
                    <div style="color:#dc3545;font-weight:600;">❌ Error: No se pudo obtener la estructura de la tabla</div>
                </div>
            `;
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
        
        let updatedCount = 0;
        for (const rowIndex in rowData) {
            const data = rowData[rowIndex];
            const id = data[0];
            
            const setClauses = [];
            
            for (let colIndex = 1; colIndex < columns.length; colIndex++) {
                const colName = columns[colIndex];
                const value = data[colIndex];
                
                const isNumber = !isNaN(value) && value !== '' && value !== null && value !== undefined;
                const isNull = value === '' || value === null || value === undefined || value === 'NULL';
                
                if (isNull) {
                    setClauses.push(`${colName} = NULL`);
                } else if (isNumber) {
                    setClauses.push(`${colName} = ${value}`);
                } else {
                    setClauses.push(`${colName} = '${String(value).replace(/'/g, "''")}'`);
                }
            }
            
            if (setClauses.length > 0) {
                const sql = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = ${id}`;
                db.run(sql);
                updatedCount++;
            }
        }
        
        loadTableEditor();
        showTablesInfo();
        updateCharts();
        generateDiagram();
        
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:15px;background:#f0fff4;border-radius:8px;border-left:4px solid #28a745;">
                <div style="color:#28a745;font-weight:600;">✅ Cambios guardados correctamente</div>
                <div style="color:#666;font-size:13px;margin-top:5px;">${updatedCount} fila(s) actualizada(s) en ${tableName}</div>
            </div>
        `;
        
    } catch(e) {
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:15px;background:#fff5f5;border-radius:8px;border-left:4px solid #dc3545;">
                <div style="color:#dc3545;font-weight:600;">❌ Error al guardar cambios</div>
                <code style="display:block;padding:10px;background:white;border-radius:6px;font-size:13px;margin-top:5px;">${e.message}</code>
            </div>
        `;
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
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:15px;background:#f0fff4;border-radius:8px;border-left:4px solid #28a745;">
                <div style="color:#28a745;font-weight:600;">✅ Registro eliminado correctamente</div>
            </div>
        `;
    } catch(e) {
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:15px;background:#fff5f5;border-radius:8px;border-left:4px solid #dc3545;">
                <div style="color:#dc3545;font-weight:600;">❌ Error al eliminar</div>
                <code style="display:block;padding:10px;background:white;border-radius:6px;font-size:13px;margin-top:5px;">${e.message}</code>
            </div>
        `;
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
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:15px;background:#f0fff4;border-radius:8px;border-left:4px solid #28a745;">
                <div style="color:#28a745;font-weight:600;">✅ Nueva fila agregada a ${tableName}</div>
            </div>
        `;
    } catch(e) {
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:15px;background:#fff5f5;border-radius:8px;border-left:4px solid #dc3545;">
                <div style="color:#dc3545;font-weight:600;">❌ Error al agregar fila</div>
                <code style="display:block;padding:10px;background:white;border-radius:6px;font-size:13px;margin-top:5px;">${e.message}</code>
            </div>
        `;
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
        
        const entities = {
            'estudiantes': {
                columns: ['id', 'nombre', 'edad', 'carrera', 'promedio', 'ciudad', 'fecha_ingreso'],
                primaryKey: 'id',
                foreignKeys: [],
                label: 'Estudiantes'
            },
            'cursos': {
                columns: ['id', 'nombre', 'creditos', 'profesor', 'departamento', 'semestre'],
                primaryKey: 'id',
                foreignKeys: [],
                label: 'Cursos'
            },
            'inscripciones': {
                columns: ['id', 'estudiante_id', 'curso_id', 'año', 'ciclo', 'nota'],
                primaryKey: 'id',
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
            
            if (index < entityNames.length - 1) {
                const currentName = name;
                const nextName = entityNames[index + 1];
                
                let relationLabel = '';
                let relationSymbol = '⟷';
                
                if (currentName === 'estudiantes' && nextName === 'inscripciones') {
                    relationLabel = '1 : N';
                    relationSymbol = '───';
                } else if (currentName === 'cursos' && nextName === 'inscripciones') {
                    relationLabel = '1 : N';
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
                            max: 20,
                            title: {
                                display: true,
                                text: 'Promedio (0-20)'
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
        document.getElementById('resultOutput').innerHTML = `
            <div style="padding:20px;text-align:center;color:#f59e0b;background:#fffbeb;border-radius:8px;">
                ⏳ Reiniciando base de datos...
            </div>
        `;
        initDatabase();
    }
}

// ===== EJEMPLOS POR CATEGORÍAS =====
function getExamplesByCategory() {
    return {
        'basicos': {
            titulo: '📌 Consultas Básicas',
            ejemplos: [
                { titulo: 'Todos los estudiantes', sql: 'SELECT * FROM estudiantes;' },
                { titulo: 'Todos los cursos', sql: 'SELECT * FROM cursos;' },
                { titulo: 'Todas las inscripciones', sql: 'SELECT * FROM inscripciones;' },
                { titulo: 'Nombres y carreras', sql: 'SELECT nombre, carrera FROM estudiantes;' },
                { titulo: 'Top 5 estudiantes', sql: 'SELECT * FROM estudiantes LIMIT 5;' }
            ]
        },
        'filtros': {
            titulo: '🔍 Filtros (WHERE)',
            ejemplos: [
                { titulo: 'Estudiantes de Ingeniería', sql: "SELECT * FROM estudiantes WHERE carrera = 'Ingeniería';" },
                { titulo: 'Estudiantes mayores de 21', sql: 'SELECT * FROM estudiantes WHERE edad > 21;' },
                { titulo: 'Estudiantes con promedio >= 16', sql: 'SELECT * FROM estudiantes WHERE promedio >= 16.0;' },
                { titulo: 'Estudiantes de Lima', sql: "SELECT * FROM estudiantes WHERE ciudad = 'Lima';" },
                { titulo: 'Ingeniería y edad >= 20', sql: "SELECT * FROM estudiantes WHERE carrera = 'Ingeniería' AND edad >= 20;" },
                { titulo: 'Medicina o Derecho', sql: "SELECT * FROM estudiantes WHERE carrera = 'Medicina' OR carrera = 'Derecho';" },
                { titulo: 'NO son de Ingeniería', sql: "SELECT * FROM estudiantes WHERE carrera != 'Ingeniería';" }
            ]
        },
        'orden': {
            titulo: '📊 Ordenamiento (ORDER BY)',
            ejemplos: [
                { titulo: 'Mejores promedios (mayor a menor)', sql: 'SELECT * FROM estudiantes ORDER BY promedio DESC;' },
                { titulo: 'Peores promedios (menor a mayor)', sql: 'SELECT * FROM estudiantes ORDER BY promedio ASC;' },
                { titulo: 'Por edad (jóvenes a mayores)', sql: 'SELECT * FROM estudiantes ORDER BY edad;' },
                { titulo: 'Alfabéticamente por nombre', sql: 'SELECT * FROM estudiantes ORDER BY nombre ASC;' },
                { titulo: 'Por carrera y luego por promedio', sql: 'SELECT * FROM estudiantes ORDER BY carrera, promedio DESC;' }
            ]
        },
        'agregacion': {
            titulo: '📈 Agregaciones (AVG, COUNT, MAX, MIN, SUM)',
            ejemplos: [
                { titulo: 'Contar todos los estudiantes', sql: 'SELECT COUNT(*) as total FROM estudiantes;' },
                { titulo: 'Promedio de edad', sql: 'SELECT AVG(edad) as edad_promedio FROM estudiantes;' },
                { titulo: 'Promedio general de calificaciones', sql: 'SELECT AVG(promedio) as promedio_general FROM estudiantes;' },
                { titulo: 'Edad máxima', sql: 'SELECT MAX(edad) as edad_maxima FROM estudiantes;' },
                { titulo: 'Edad mínima', sql: 'SELECT MIN(edad) as edad_minima FROM estudiantes;' },
                { titulo: 'Suma de créditos', sql: 'SELECT SUM(creditos) as total_creditos FROM cursos;' }
            ]
        },
        'groupby': {
            titulo: '📊 Agrupaciones (GROUP BY)',
            ejemplos: [
                { titulo: 'Estudiantes por carrera', sql: 'SELECT carrera, COUNT(*) as cantidad FROM estudiantes GROUP BY carrera;' },
                { titulo: 'Promedio de edad por carrera', sql: 'SELECT carrera, AVG(edad) as edad_promedio FROM estudiantes GROUP BY carrera;' },
                { titulo: 'Promedio de calificaciones por carrera', sql: 'SELECT carrera, ROUND(AVG(promedio), 2) as promedio FROM estudiantes GROUP BY carrera;' },
                { titulo: 'Estudiantes por ciudad', sql: 'SELECT ciudad, COUNT(*) as cantidad FROM estudiantes GROUP BY ciudad;' },
                { titulo: 'Cursos por profesor', sql: 'SELECT profesor, COUNT(*) as cantidad FROM cursos GROUP BY profesor;' }
            ]
        },
        'having': {
            titulo: '🎯 Filtros de Agrupación (HAVING)',
            ejemplos: [
                { titulo: 'Carreras con más de 3 estudiantes', sql: 'SELECT carrera, COUNT(*) as cantidad FROM estudiantes GROUP BY carrera HAVING COUNT(*) > 3;' },
                { titulo: 'Carreras con promedio > 16', sql: 'SELECT carrera, ROUND(AVG(promedio), 2) as promedio FROM estudiantes GROUP BY carrera HAVING AVG(promedio) > 16.0;' }
            ]
        },
        'join': {
            titulo: '🔗 JOIN (Relaciones entre tablas)',
            ejemplos: [
                { titulo: 'Estudiantes con sus cursos', sql: 'SELECT e.nombre, c.nombre as curso FROM estudiantes e JOIN inscripciones i ON e.id = i.estudiante_id JOIN cursos c ON i.curso_id = c.id LIMIT 10;' },
                { titulo: 'Ingeniería con sus cursos', sql: "SELECT e.nombre, c.nombre as curso FROM estudiantes e JOIN inscripciones i ON e.id = i.estudiante_id JOIN cursos c ON i.curso_id = c.id WHERE e.carrera = 'Ingeniería' LIMIT 10;" },
                { titulo: 'Cursos con cantidad de inscritos', sql: 'SELECT c.nombre, COUNT(i.estudiante_id) as inscritos FROM cursos c LEFT JOIN inscripciones i ON c.id = i.curso_id GROUP BY c.nombre ORDER BY inscritos DESC;' },
                { titulo: 'Profesores con total de estudiantes', sql: 'SELECT c.profesor, COUNT(i.estudiante_id) as total FROM cursos c LEFT JOIN inscripciones i ON c.id = i.curso_id GROUP BY c.profesor ORDER BY total DESC;' },
                { titulo: 'Estudiantes, curso y profesor', sql: 'SELECT e.nombre as estudiante, c.nombre as curso, c.profesor FROM estudiantes e JOIN inscripciones i ON e.id = i.estudiante_id JOIN cursos c ON i.curso_id = c.id ORDER BY e.nombre LIMIT 10;' }
            ]
        },
        'subconsultas': {
            titulo: '🔍 Subconsultas',
            ejemplos: [
                { titulo: 'Promedio mayor al general', sql: 'SELECT * FROM estudiantes WHERE promedio > (SELECT AVG(promedio) FROM estudiantes);' },
                { titulo: 'Más jóvenes que el promedio', sql: 'SELECT * FROM estudiantes WHERE edad < (SELECT AVG(edad) FROM estudiantes);' },
                { titulo: 'Cursos con más créditos que el promedio', sql: 'SELECT * FROM cursos WHERE creditos > (SELECT AVG(creditos) FROM cursos);' },
                { titulo: 'Estudiantes con la edad máxima', sql: 'SELECT * FROM estudiantes WHERE edad = (SELECT MAX(edad) FROM estudiantes);' },
                { titulo: 'Estudiantes con el mejor promedio', sql: 'SELECT * FROM estudiantes WHERE promedio = (SELECT MAX(promedio) FROM estudiantes);' }
            ]
        },
        'operadores': {
            titulo: '🎯 Operadores Especiales',
            ejemplos: [
                { titulo: 'IN: Ingeniería o Medicina', sql: "SELECT * FROM estudiantes WHERE carrera IN ('Ingeniería', 'Medicina');" },
                { titulo: 'NOT IN: No son de Derecho o Arquitectura', sql: "SELECT * FROM estudiantes WHERE carrera NOT IN ('Derecho', 'Arquitectura');" },
                { titulo: 'BETWEEN: Edad entre 20 y 22', sql: 'SELECT * FROM estudiantes WHERE edad BETWEEN 20 AND 22;' },
                { titulo: 'BETWEEN: Promedio entre 14 y 18', sql: 'SELECT * FROM estudiantes WHERE promedio BETWEEN 14.0 AND 18.0;' },
                { titulo: 'LIKE: Nombres que empiezan con "A"', sql: "SELECT * FROM estudiantes WHERE nombre LIKE 'A%';" },
                { titulo: 'LIKE: Nombres que contienen "a"', sql: "SELECT * FROM estudiantes WHERE nombre LIKE '%a%';" },
                { titulo: 'DISTINCT: Carreras únicas', sql: 'SELECT DISTINCT carrera FROM estudiantes;' }
            ]
        },
        'avanzado': {
            titulo: '🚀 Consultas Avanzadas',
            ejemplos: [
                { titulo: 'Top 3 carreras con mejor promedio', sql: 'SELECT carrera, ROUND(AVG(promedio), 2) as promedio FROM estudiantes GROUP BY carrera ORDER BY promedio DESC LIMIT 3;' },
                { titulo: 'Estudiantes que cursan más de 2 materias', sql: 'SELECT e.nombre, COUNT(i.curso_id) as cursos FROM estudiantes e JOIN inscripciones i ON e.id = i.estudiante_id GROUP BY e.nombre HAVING COUNT(i.curso_id) > 2;' },
                { titulo: 'Promedio de créditos por carrera', sql: 'SELECT e.carrera, ROUND(AVG(c.creditos), 2) as promedio_creditos FROM estudiantes e JOIN inscripciones i ON e.id = i.estudiante_id JOIN cursos c ON i.curso_id = c.id GROUP BY e.carrera;' },
                { titulo: 'Profesores con más de 3 estudiantes', sql: 'SELECT c.profesor, COUNT(i.estudiante_id) as total FROM cursos c JOIN inscripciones i ON c.id = i.curso_id GROUP BY c.profesor HAVING COUNT(i.estudiante_id) >= 3;' },
                { titulo: 'Estudiantes sin cursos', sql: 'SELECT e.nombre FROM estudiantes e LEFT JOIN inscripciones i ON e.id = i.estudiante_id WHERE i.estudiante_id IS NULL;' }
            ]
        },
        'modificacion': {
            titulo: '✏️ Modificación (INSERT, UPDATE, DELETE)',
            ejemplos: [
                { titulo: 'INSERT: Agregar estudiante', sql: "INSERT INTO estudiantes (id, nombre, edad, carrera, promedio, ciudad, fecha_ingreso) VALUES (26, 'Nuevo Estudiante', 20, 'Ingeniería', 14.0, 'Lima', '2024-06-01');" },
                { titulo: 'INSERT: Agregar curso', sql: "INSERT INTO cursos (id, nombre, creditos, profesor, departamento, semestre) VALUES (16, 'Inteligencia Artificial', 5, 'Dr. Pérez', 'Ingeniería', 4);" },
                { titulo: 'UPDATE: Actualizar promedio', sql: "UPDATE estudiantes SET promedio = 18.5 WHERE nombre = 'Ana García';" },
                { titulo: 'UPDATE: Cambiar carrera', sql: "UPDATE estudiantes SET carrera = 'Ingeniería de Software' WHERE id = 4;" },
                { titulo: 'UPDATE: Incrementar edad', sql: 'UPDATE estudiantes SET edad = edad + 1;' },
                { titulo: 'DELETE: Eliminar estudiante', sql: 'DELETE FROM estudiantes WHERE id = 26;' }
            ]
        }
    };
}

// ===== MOSTRAR EJEMPLO POR CATEGORÍA =====
function showExampleByCategory() {
    const category = document.getElementById('categorySelector').value;
    const categories = getExamplesByCategory();
    
    let selectedCategory = category;
    if (category === 'aleatorio') {
        const keys = Object.keys(categories);
        selectedCategory = keys[Math.floor(Math.random() * keys.length)];
        document.getElementById('categorySelector').value = selectedCategory;
    }
    
    const categoryData = categories[selectedCategory];
    if (!categoryData) return;
    
    const ejemplos = categoryData.ejemplos;
    const ejemplo = ejemplos[Math.floor(Math.random() * ejemplos.length)];
    
    const editor = document.getElementById('sqlEditor');
    editor.value = ejemplo.sql;
    editor.focus();
    
    document.getElementById('resultOutput').innerHTML = `
        <div style="padding: 15px; background: #f0f4ff; border-radius: 8px; border-left: 4px solid #667eea;">
            <div style="color: #667eea; font-weight: 700; font-size: 16px; margin-bottom: 5px;">
                📚 ${categoryData.titulo}
            </div>
            <div style="color: #555; font-size: 14px; margin-bottom: 8px;">
                💡 ${ejemplo.titulo}
            </div>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 13px; overflow-x: auto; white-space: pre-wrap; word-break: break-all;">
                ${ejemplo.sql}
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #999;">
                ⏰ Presiona <strong>"Ejecutar"</strong> o <strong>Ctrl+Enter</strong> para ver el resultado
            </div>
        </div>
    `;
}

// ===== FUNCIÓN ORIGINAL PARA COMPATIBILIDAD =====
function showExamples() {
    showExampleByCategory();
}

// ===== ATAJOS DE TECLADO =====
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter: Ejecutar
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        runQuery();
    }
    // Ctrl+Shift+R: Reiniciar BD
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        resetDatabase();
    }
    // Ctrl+E: Mostrar ejemplos
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        showExamples();
    }
    // Ctrl+L: Limpiar editor
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearEditor();
    }
});

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', function() {
    initDatabase();
    
    // Año automático en el footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

// ===== DONACIONES CON QR LOCAL (VERSIÓN SIMPLE) =====
function showDonationQR(type) {
    const container = document.getElementById('donationQRContainer');
    const content = document.getElementById('donationQRContent');
    
    // QR desde imágenes locales (TÚ SOLO PUEDES CAMBIARLAS)
    const qrImages = {
        'yape': {
            title: '📱 Yape',
            subtitle: 'Escanea el QR con Yape para donar',
            image: 'images/qr-yape.jpeg'  // ← Tu QR real
        },
        'plin': {
            title: '📱 Plin',
            subtitle: 'Escanea el QR con Plin para donar',
            image: 'images/qr-plin.jpeg'  // ← Tu QR real
        }
    };
    
    const qrData = qrImages[type];
    if (!qrData) return;
    
    content.innerHTML = `
        <div class="qr-title">${qrData.title}</div>
        <img src="${qrData.image}" alt="QR para ${qrData.title}" />
        <div class="qr-subtitle">${qrData.subtitle}</div>
        <div class="qr-footer">
            ⭐ ¡Gracias por tu apoyo! 
            <br>
            <span style="font-size:0.9em;color:#999;">
                Todas las donaciones son voluntarias
            </span>
        </div>
    `;
    
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeDonationQR() {
    document.getElementById('donationQRContainer').style.display = 'none';
}

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
window.showExampleByCategory = showExampleByCategory;
// ===== NUEVAS FUNCIONES DE DONACIONES =====
window.showDonationQR = showDonationQR;
window.closeDonationQR = closeDonationQR;