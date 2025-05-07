import streamlit as st
import sqlite3
from datetime import datetime, date, timedelta
import pandas as pd
import logging
import tempfile
from fpdf import FPDF
import base64
import os
import hashlib
import time
from typing import List, Tuple, Optional, Dict, Any

# --- Configuración inicial ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Constantes ---
GRUPOS = {(0, 2): "Oruguitas", (2, 4): "Pollitos", (4, 7): "Ovejitas", 
          (7, 10): "Leones", (10, 13): "Panteras"}
PROGRAMAS = ["IMAS", "PANI", "Privado"]
MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
         "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

# --- Clase DatabaseManager optimizada ---
class DatabaseManager:
    def __init__(self, db_name: str = 'guarderia.db'):
        self.db_name = db_name
        self._setup_adapters()
        self.conn = sqlite3.connect(db_name, check_same_thread=False, detect_types=sqlite3.PARSE_DECLTYPES)
        self.cursor = self.conn.cursor()
        self._create_tables()
        self._crear_usuario_admin()
        
    def _setup_adapters(self):
        sqlite3.register_adapter(date, lambda d: d.isoformat())
        sqlite3.register_adapter(datetime, lambda dt: dt.isoformat())
        sqlite3.register_converter("DATE", lambda s: date.fromisoformat(s.decode()))
        sqlite3.register_converter("DATETIME", lambda s: datetime.fromisoformat(s.decode()))
    
    def _create_tables(self):
        tables = {
            'ninos': '''
                CREATE TABLE IF NOT EXISTS ninos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL,
                    cedula TEXT UNIQUE NOT NULL,
                    encargado1 TEXT NOT NULL,
                    tel1 TEXT NOT NULL,
                    encargado2 TEXT,
                    tel2 TEXT,
                    correo TEXT,
                    alergias TEXT,
                    edad INTEGER NOT NULL,
                    nacimiento DATE NOT NULL,
                    domicilio TEXT,
                    grupo TEXT NOT NULL,
                    programa TEXT NOT NULL,
                    foto TEXT
                )''',
            'egresos': '''
                CREATE TABLE IF NOT EXISTS egresos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nino_id INTEGER,
                    nombre TEXT NOT NULL,
                    cedula TEXT NOT NULL,
                    edad INTEGER NOT NULL,
                    grupo TEXT NOT NULL,
                    fecha DATE NOT NULL,
                    notas TEXT,
                    programa TEXT NOT NULL,
                    FOREIGN KEY (nino_id) REFERENCES ninos (id)
                )''',
            'asistencias': '''
                CREATE TABLE IF NOT EXISTS asistencias (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nino_id INTEGER NOT NULL,
                    fecha DATE NOT NULL,
                    presente BOOLEAN NOT NULL,
                    FOREIGN KEY (nino_id) REFERENCES ninos (id),
                    UNIQUE (nino_id, fecha)
                )''',
            'usuarios': '''
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    rol TEXT NOT NULL
                )'''
        }
        
        for name, query in tables.items():
            try:
                self.cursor.execute(query)
                self.conn.commit()
            except sqlite3.Error as e:
                logger.error(f"Error creating {name} table: {e}")

    def _crear_usuario_admin(self):
        try:
            usuarios = self.execute("SELECT * FROM usuarios WHERE username = 'admin'")
            if not usuarios:
                password_hash = hashlib.sha256("admin123".encode()).hexdigest()
                self.execute(
                    "INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, ?)",
                    ("admin", password_hash, "admin"),
                    fetch=False
                )
                self.commit()
        except sqlite3.Error as e:
            logger.error(f"Error al crear usuario admin: {e}")

    def execute(self, query: str, params: tuple = (), fetch: bool = True) -> Optional[List[Tuple]]:
        try:
            self.cursor.execute(query, params)
            return self.cursor.fetchall() if fetch else None
        except sqlite3.Error as e:
            logger.error(f"SQL error: {e}")
            raise

    def commit(self):
        try:
            self.conn.commit()
        except sqlite3.Error as e:
            logger.error(f"Commit error: {e}")
            raise

    def close(self):
        self.conn.close()

# --- Funciones utilitarias ---
def calcular_edad_y_grupo(nacimiento: date) -> Tuple[int, str]:
    hoy = date.today()
    edad = hoy.year - nacimiento.year - ((hoy.month, hoy.day) < (nacimiento.month, nacimiento.day))
    edad = max(0, edad)
    
    for (min_edad, max_edad), grupo in GRUPOS.items():
        if min_edad <= edad < max_edad:
            return edad, grupo
    return edad, "Sin grupo"

def validar_datos(cedula: str, tel1: str, tel2: str = "") -> bool:
    valid = True
    if len(cedula) != 9 or not cedula.isdigit():
        st.error("Cédula inválida. Debe tener 9 dígitos")
        valid = False
    if not (tel1.isdigit() and len(tel1) >= 8):
        st.error("Teléfono 1 inválido. Mínimo 8 dígitos")
        valid = False
    if tel2 and not (tel2.isdigit() and len(tel2) >= 8):
        st.error("Teléfono 2 inválido. Mínimo 8 dígitos")
        valid = False
    return valid

def obtener_dias_mes(ano: int, mes: int) -> List[date]:
    primer_dia = date(ano, mes, 1)
    if mes == 12:
        ultimo_dia = date(ano + 1, 1, 1)
    else:
        ultimo_dia = date(ano, mes + 1, 1)
    return [primer_dia + timedelta(days=i) for i in range((ultimo_dia - primer_dia).days)]

# --- Funciones de reporte ---
def generar_reporte(data: List[Tuple], columns: List[str], formato: str = 'excel', titulo: str = "Reporte") -> bytes:
    df = pd.DataFrame(data, columns=columns)
    
    if formato == 'excel':
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            df.to_excel(tmp.name, index=False, engine='openpyxl')
            tmp.close()
            with open(tmp.name, "rb") as f:
                bytes_data = f.read()
            try:
                os.unlink(tmp.name)
            except PermissionError:
                time.sleep(0.1)
                os.unlink(tmp.name)
        return bytes_data
    
    elif formato == 'pdf':
        pdf = FPDF(orientation='L')
        pdf.add_page()
        pdf.set_font("Arial", size=8)
        col_width = pdf.w / len(columns)
        
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, titulo, 0, 1, 'C')
        pdf.ln(5)
        
        pdf.set_font("Arial", 'B', 8)
        for col in columns:
            pdf.cell(col_width, 10, col, border=1, align='C')
        pdf.ln()
        
        pdf.set_font("Arial", size=8)
        for _, row in df.iterrows():
            for col in columns:
                texto = str(row[col])[:25] + "..." if len(str(row[col])) > 25 else str(row[col])
                pdf.cell(col_width, 10, texto, border=1)
            pdf.ln()
        
        return pdf.output(dest='S').encode('latin1')

def crear_boton_descarga(bytes_data: bytes, nombre_archivo: str, texto: str):
    b64 = base64.b64encode(bytes_data).decode()
    href = f'<a href="data:application/octet-stream;base64,{b64}" download="{nombre_archivo}">{texto}</a>'
    st.markdown(href, unsafe_allow_html=True)

# --- Autenticación ---
def setup_autenticacion(db: DatabaseManager):
    if 'autenticado' not in st.session_state:
        st.session_state.update({
            'autenticado': False,
            'usuario': None,
            'pagina': 'principal',
            'editar_nino_id': None,
            'detalle_id': None,
            'usuario_a_eliminar': None
        })
        
    if not st.session_state.autenticado:
        with st.sidebar:
            st.title("Inicio de Sesión")
            username = st.text_input("Usuario")
            password = st.text_input("Contraseña", type="password")
            
            if st.button("Ingresar"):
                user = db.execute(
                    "SELECT * FROM usuarios WHERE username = ?", 
                    (username,)
                )
                if user and user[0][2] == hashlib.sha256(password.encode()).hexdigest():
                    st.session_state.update({
                        'autenticado': True,
                        'usuario': user[0]
                    })
                    st.rerun()
                else:
                    st.error("Credenciales incorrectas")
        st.stop()

# --- UI Helper Functions ---
def setup_ui():
    st.set_page_config(page_title="Guardería San Gabriel", layout="wide", page_icon="👶")
    try:
        st.image("logo.png", width=150)
    except:
        st.title("Guardería San Gabriel")

def mostrar_menu():
    with st.sidebar:
        if st.session_state.autenticado:
            st.title(f"Hola, {st.session_state.usuario[1]}")
            if st.button("🔒 Cerrar sesión"):
                st.session_state.autenticado = False
                st.rerun()
            
            opciones = ["Registro de Niños", "Control de Asistencias", "Egreso de Niños", "Historial de Egresos"]
            
            if st.session_state.usuario[3] == "admin":
                opciones.append("Administración")
            
            return st.selectbox(
                "📁 Menú Principal",
                opciones,
                key="menu_principal"
            )

# --- Vistas ---
def vista_ninos(db: DatabaseManager):
    st.header("👶 Registro de Niños")
    
    # --- Sección de Filtros Principal ---
    with st.expander("🔍 Filtros Básicos", expanded=False):
        cols = st.columns(4)
        filtro_nombre = cols[0].text_input("Por nombre")
        filtro_cedula = cols[1].text_input("Por cédula")
        filtro_grupo = cols[2].selectbox("Por grupo", ["Todos"] + list(GRUPOS.values()))
        filtro_programa = cols[3].selectbox("Por programa", ["Todos"] + PROGRAMAS)
    
    # Consulta base
    query = "SELECT id, nombre, cedula, edad, grupo, programa, alergias, domicilio, nacimiento FROM ninos WHERE 1=1"
    params = []
    
    if filtro_nombre:
        query += " AND nombre LIKE ?"
        params.append(f"%{filtro_nombre}%")
    if filtro_cedula:
        query += " AND cedula LIKE ?"
        params.append(f"%{filtro_cedula}%")
    if filtro_grupo != "Todos":
        query += " AND grupo = ?"
        params.append(filtro_grupo)
    if filtro_programa != "Todos":
        query += " AND programa = ?"
        params.append(filtro_programa)
    
    query += " ORDER BY grupo, nombre"
    ninos = db.execute(query, tuple(params))
    
    # --- Botones de Acción ---
    col1, col2 = st.columns(2)
    with col1:
        if st.button("➕ Agregar nuevo niño"):
            st.session_state.editar_nino_id = None
            st.rerun()
    with col2:
        if st.button("📊 Generar Reporte Personalizado"):
            st.session_state.mostrar_filtros_reporte = not st.session_state.get('mostrar_filtros_reporte', False)
    
    # --- Visualización Principal ---
    if ninos:
        df = pd.DataFrame(ninos, columns=["ID", "Nombre", "Cédula", "Edad", "Grupo", "Programa", "Alergias", "Domicilio", "Nacimiento"])
        st.dataframe(
            df[["Nombre", "Cédula", "Edad", "Grupo", "Programa"]],
            use_container_width=True,
            hide_index=True,
            column_config={
                "Nombre": "Nombre del Niño",
                "Cédula": "Cédula",
                "Edad": st.column_config.NumberColumn("Edad", format="%d años"),
                "Grupo": "Grupo",
                "Programa": "Programa"
            }
        )
    
    # --- Sección de Reportes Personalizados ---
    if st.session_state.get('mostrar_filtros_reporte', False):
        with st.expander("⚙️ Configuración del Reporte", expanded=True):
            st.subheader("Filtros Avanzados para Reporte")
            
            cols = st.columns(3)
            with cols[0]:
                # Filtro por grupo específico
                grupo_reporte = st.selectbox(
                    "Grupo específico (opcional)",
                    ["Todos"] + list(GRUPOS.values()),
                    key="grupo_reporte"
                )
                
                # Filtro por edad máxima
                edad_maxima = st.number_input(
                    "Edad máxima (opcional)",
                    min_value=0,
                    max_value=13,
                    value=13,
                    key="edad_maxima"
                )
            
            with cols[1]:
                # Filtro por programa específico
                programa_reporte = st.selectbox(
                    "Programa específico (opcional)",
                    ["Todos"] + PROGRAMAS,
                    key="programa_reporte"
                )
                
                # Filtro por edad mínima
                edad_minima = st.number_input(
                    "Edad mínima (opcional)",
                    min_value=0,
                    max_value=13,
                    value=0,
                    key="edad_minima"
                )
            
            with cols[2]:
                # Filtro por alergias
                filtro_alergias = st.selectbox(
                    "Filtrar por alergias",
                    ["Todos", "Con alergias", "Sin alergias"],
                    key="filtro_alergias"
                )
                
                # Opciones de formato
                formato_reporte = st.radio(
                    "Formato del reporte",
                    ["Excel", "PDF"],
                    horizontal=True,
                    key="formato_reporte"
                )
            
            # Selección de columnas a incluir
            columnas_disponibles = [
                "Nombre", "Cédula", "Edad", "Grupo", "Programa",
                "Alergias", "Domicilio", "Fecha Nacimiento"
            ]
            columnas_seleccionadas = st.multiselect(
                "Seleccione las columnas a incluir en el reporte",
                options=columnas_disponibles,
                default=["Nombre", "Cédula", "Edad", "Grupo", "Programa"],
                key="columnas_reporte"
            )
            
            # Generar reporte
            if st.button("Generar Reporte", key="generar_reporte"):
                # Aplicar filtros adicionales
                ninos_filtrados = []
                for nino in ninos:
                    cumple_filtros = True
                    
                    # Filtro por grupo
                    if grupo_reporte != "Todos" and nino[4] != grupo_reporte:
                        cumple_filtros = False
                    
                    # Filtro por programa
                    if programa_reporte != "Todos" and nino[5] != programa_reporte:
                        cumple_filtros = False
                    
                    # Filtro por edad
                    if not (edad_minima <= nino[3] <= edad_maxima):
                        cumple_filtros = False
                    
                    # Filtro por alergias
                    if filtro_alergias == "Con alergias" and not nino[6]:
                        cumple_filtros = False
                    elif filtro_alergias == "Sin alergias" and nino[6]:
                        cumple_filtros = False
                    
                    if cumple_filtros:
                        ninos_filtrados.append(nino)
                
                if not ninos_filtrados:
                    st.warning("No hay niños que coincidan con los filtros seleccionados")
                else:
                    # Preparar datos para el reporte
                    datos_reporte = []
                    for nino in ninos_filtrados:
                        fila = []
                        for col in columnas_seleccionadas:
                            if col == "Nombre":
                                fila.append(nino[1])
                            elif col == "Cédula":
                                fila.append(nino[2])
                            elif col == "Edad":
                                fila.append(nino[3])
                            elif col == "Grupo":
                                fila.append(nino[4])
                            elif col == "Programa":
                                fila.append(nino[5])
                            elif col == "Alergias":
                                fila.append(nino[6] or "Ninguna")
                            elif col == "Domicilio":
                                fila.append(nino[7] or "No especificado")
                            elif col == "Fecha Nacimiento":
                                fila.append(nino[8].strftime("%d/%m/%Y"))
                        datos_reporte.append(tuple(fila))
                    
                    # Generar y descargar reporte
                    nombre_reporte = f"Reporte_Ninos_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                    bytes_data = generar_reporte(
                        datos_reporte,
                        columnas_seleccionadas,
                        formato_reporte.lower(),
                        nombre_reporte
                    )
                    
                    extension = "xlsx" if formato_reporte == "Excel" else "pdf"
                    crear_boton_descarga(
                        bytes_data,
                        f"{nombre_reporte}.{extension}",
                        f"⬇️ Descargar Reporte ({formato_reporte})"
                    )
    
    if st.session_state.get('editar_nino_id') is not None:
        mostrar_formulario_nino(db, st.session_state.editar_nino_id)

def vista_asistencias(db: DatabaseManager):
    st.header("📅 Control de Asistencias", divider="rainbow")
    
    # --- Sección 1: Limpieza de datos duplicados (solo para admin) ---
    if st.session_state.usuario[3] == "admin":
        with st.expander("⚙️ Herramientas de administración", expanded=False):
            if st.button("🔄 Limpiar registros duplicados de asistencias"):
                try:
                    # Consulta para eliminar duplicados manteniendo el registro más reciente
                    db.execute("""
                        DELETE FROM asistencias 
                        WHERE id NOT IN (
                            SELECT MIN(id) 
                            FROM asistencias 
                            GROUP BY nino_id, fecha
                        )
                    """, fetch=False)
                    db.commit()
                    st.success("Registros duplicados eliminados correctamente!")
                    time.sleep(1)
                    st.rerun()
                except Exception as e:
                    st.error(f"Error al limpiar duplicados: {e}")

    # --- Sección 2: Registro de Asistencias ---
    st.subheader("➕ Registrar Asistencias", divider="blue")
    
    ninos_activos = db.execute("""
        SELECT id, nombre, grupo FROM ninos 
        ORDER BY grupo, nombre
    """)
    
    if not ninos_activos:
        st.warning("No hay niños registrados")
        return
    
    col1, col2 = st.columns(2)
    
    with col1:
        nino_seleccionado = st.selectbox(
            "Seleccione el niño:",
            options=[f"{nino[1]} ({nino[2]})" for nino in ninos_activos],
            key="select_nino_asistencia"
        )
        nino_id = next(n[0] for n in ninos_activos if f"{n[1]} ({n[2]})" == nino_seleccionado)
    
    with col2:
        fecha_seleccionada = st.date_input("Fecha:", value=date.today(), key="fecha_asistencia")
    
    # Obtener la asistencia existente más reciente para esta combinación
    asistencia_existente = db.execute(
        "SELECT presente FROM asistencias WHERE nino_id = ? AND fecha = ? ORDER BY id DESC LIMIT 1",
        (nino_id, fecha_seleccionada)
    )
    presente = asistencia_existente[0][0] if asistencia_existente else True
    
    with st.form("form_asistencia", clear_on_submit=True):
        estado = st.radio(
            "Estado de asistencia:",
            options=["✅ Presente", "❌ Ausente"],
            index=0 if presente else 1,
            key="estado_asistencia"
        )
        
        if st.form_submit_button("💾 Guardar Asistencia", type="primary"):
            try:
                # Verificar si ya existe un registro para esta fecha y niño
                existe = db.execute(
                    "SELECT 1 FROM asistencias WHERE nino_id = ? AND fecha = ? LIMIT 1",
                    (nino_id, fecha_seleccionada)
                )
                
                if existe:
                    # Actualizar el registro existente más reciente
                    db.execute(
                        """UPDATE asistencias SET presente = ?
                        WHERE id = (
                            SELECT id FROM asistencias 
                            WHERE nino_id = ? AND fecha = ?
                            ORDER BY id DESC LIMIT 1
                        )""",
                        (estado == "✅ Presente", nino_id, fecha_seleccionada),
                        fetch=False
                    )
                else:
                    # Insertar nuevo registro
                    db.execute(
                        """INSERT INTO asistencias 
                        (nino_id, fecha, presente) VALUES (?, ?, ?)""",
                        (nino_id, fecha_seleccionada, estado == "✅ Presente"),
                        fetch=False
                    )
                
                db.commit()
                st.success("✅ Asistencia guardada correctamente!")
                time.sleep(1)
                st.rerun()
            except Exception as e:
                st.error(f"Error al guardar asistencia: {e}")
    
    # --- Sección 3: Reporte de Asistencias ---
    st.subheader("📊 Reporte de Asistencias", divider="green")
    
    with st.form("form_reporte_asistencias"):
        hoy = date.today()
        fecha_inicio = st.date_input("Fecha inicio:", value=hoy-timedelta(days=7), key="fecha_inicio_reporte")
        fecha_fin = st.date_input("Fecha fin:", value=hoy, key="fecha_fin_reporte")
        
        ninos_opciones = [f"{n[1]} ({n[2]})" for n in ninos_activos]
        ninos_seleccionados = st.multiselect(
            "Seleccione los niños a incluir (dejar vacío para todos):",
            options=ninos_opciones,
            default=None,
            key="ninos_seleccionados_reporte"
        )
        
        if st.form_submit_button("Generar Reporte", type="primary"):
            if fecha_inicio > fecha_fin:
                st.error("La fecha de inicio debe ser anterior a la fecha fin")
            else:
                # Consulta optimizada para obtener el último registro por niño y fecha
                query = """
                    SELECT n.nombre, n.grupo, a.fecha, a.presente 
                    FROM asistencias a
                    JOIN ninos n ON a.nino_id = n.id
                    WHERE a.fecha BETWEEN ? AND ?
                """
                params = [fecha_inicio, fecha_fin]
                
                if ninos_seleccionados:
                    ids_seleccionados = [
                        n[0] for n in ninos_activos 
                        if f"{n[1]} ({n[2]})" in ninos_seleccionados
                    ]
                    query += " AND a.nino_id IN (" + ",".join(["?"] * len(ids_seleccionados)) + ")"
                    params.extend(ids_seleccionados)
                
                query += " ORDER BY a.fecha DESC, n.nombre"
                
                try:
                    asistencias = db.execute(query, tuple(params))
                    
                    if not asistencias:
                        st.warning("No hay registros de asistencia en el período seleccionado")
                    else:
                        df_reporte = pd.DataFrame(asistencias, columns=["Nombre", "Grupo", "Fecha", "Presente"])
                        df_reporte["Estado"] = df_reporte["Presente"].apply(
                            lambda x: "✅ Presente" if x else "❌ Ausente"
                        )
                        df_reporte["Fecha"] = pd.to_datetime(df_reporte["Fecha"]).dt.strftime("%d/%m/%Y")
                        
                        # Mostrar resumen estadístico
                        st.markdown("### 📈 Resumen Estadístico")
                        total_registros = len(df_reporte)
                        presentes = df_reporte["Presente"].sum()
                        ausentes = total_registros - presentes
                        
                        col1, col2, col3 = st.columns(3)
                        col1.metric("Total de registros", total_registros)
                        col2.metric("Asistencias", presentes, f"{round(presentes/total_registros*100, 1)}%")
                        col3.metric("Ausencias", ausentes, f"{round(ausentes/total_registros*100, 1)}%")
                        
                        # Mostrar reporte detallado
                        st.markdown("### 📋 Detalle de Asistencias")
                        st.dataframe(
                            df_reporte[["Nombre", "Grupo", "Fecha", "Estado"]],
                            use_container_width=True,
                            hide_index=True,
                            column_config={
                                "Nombre": "Nombre del Niño",
                                "Grupo": "Grupo",
                                "Fecha": "Fecha",
                                "Estado": "Asistencia"
                            }
                        )
                        
                        # Opciones de exportación
                        formato = st.radio(
                            "Formato de exportación:",
                            ["Excel", "PDF"],
                            horizontal=True,
                            key="formato_reporte"
                        )
                        
                        bytes_data = generar_reporte(
                            asistencias, 
                            ["Nombre", "Grupo", "Fecha", "Estado"], 
                            formato.lower(),
                            f"Reporte de Asistencias {fecha_inicio.strftime('%d/%m/%Y')} - {fecha_fin.strftime('%d/%m/%Y')}"
                        )
                        
                        extension = "xlsx" if formato == "Excel" else "pdf"
                        crear_boton_descarga(
                            bytes_data, 
                            f"reporte_asistencias_{fecha_inicio.strftime('%Y%m%d')}_{fecha_fin.strftime('%Y%m%d')}.{extension}", 
                            f"⬇️ Descargar Reporte {formato}"
                        )
                except Exception as e:
                    st.error(f"Error al generar reporte: {e}")

def vista_egresos(db: DatabaseManager):
    st.header("🚪 Egreso de Niños")
    
    ninos_activos = db.execute("""
        SELECT id, nombre, cedula, edad, grupo, programa FROM ninos 
        ORDER BY grupo, nombre
    """)
    
    if not ninos_activos:
        st.warning("No hay niños registrados")
        return
    
    nino_seleccionado = st.selectbox(
        "Seleccione el niño:",
        options=[f"{nino[1]} ({nino[2]}) - {nino[4]}" for nino in ninos_activos],
        key="select_nino_egreso"
    )
    nino_id = next(n[0] for n in ninos_activos if f"{n[1]} ({n[2]}) - {n[4]}" == nino_seleccionado)
    
    nino_data = next(n for n in ninos_activos if n[0] == nino_id)
    
    with st.form("form_egreso", clear_on_submit=True):
        fecha_egreso = st.date_input("Fecha de egreso", value=date.today())
        notas = st.text_area("Notas adicionales (opcional)")
        
        if st.form_submit_button("Registrar Egreso", type="primary"):
            try:
                # Registrar en tabla de egresos
                db.execute(
                    """INSERT INTO egresos 
                    (nino_id, nombre, cedula, edad, grupo, fecha, notas, programa)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        nino_id, nino_data[1], nino_data[2], nino_data[3], 
                        nino_data[4], fecha_egreso, notas or None, nino_data[5]
                    ),
                    fetch=False
                )
                
                # Eliminar de la tabla de niños
                db.execute(
                    "DELETE FROM ninos WHERE id = ?",
                    (nino_id,),
                    fetch=False
                )
                
                db.commit()
                st.success("✅ Egreso registrado correctamente!")
                time.sleep(1)
                st.rerun()
            except Exception as e:
                st.error(f"Error al registrar egreso: {e}")

def vista_historial_egresos(db: DatabaseManager):
    st.header("📋 Historial de Egresos")
    
    hoy = date.today()
    fecha_inicio = st.date_input("Fecha inicio", value=hoy-timedelta(days=30))
    fecha_fin = st.date_input("Fecha fin", value=hoy)
    
    if fecha_inicio > fecha_fin:
        st.error("La fecha de inicio debe ser anterior a la fecha fin")
        return
    
    # Consulta SQL que obtiene los datos
    egresos = db.execute(
        """SELECT e.nombre, e.cedula, e.edad, e.grupo, e.fecha, e.notas, e.programa
           FROM egresos e
           WHERE e.fecha BETWEEN ? AND ?
           ORDER BY e.fecha DESC""",
        (fecha_inicio, fecha_fin)
    )
    
    if not egresos:
        st.info("No hay egresos registrados en el período seleccionado")
        return
    
    # Definir las columnas que coincidan exactamente con la consulta SQL
    columnas = ["Nombre", "Cédula", "Edad", "Grupo", "Fecha", "Notas", "Programa"]
    df = pd.DataFrame(egresos, columns=columnas)
    
    ninos_disponibles = df['Nombre'].unique()
    ninos_seleccionados = st.multiselect(
        "Seleccione los niños a incluir en el reporte (dejar vacío para todos)",
        ninos_disponibles
    )
    
    if ninos_seleccionados:
        df = df[df['Nombre'].isin(ninos_seleccionados)]
    
    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Nombre": "Nombre del Niño",
            "Cédula": "Cédula",
            "Edad": st.column_config.NumberColumn("Edad", format="%d años"),
            "Grupo": "Grupo",
            "Fecha": st.column_config.DateColumn("Fecha de Egreso", format="DD/MM/YYYY"),
            "Programa": "Programa",
            "Notas": "Observaciones"
        }
    )
    
    st.markdown("### 📊 Generar Reporte")
    formato = st.radio("Formato del reporte:", ["Excel", "PDF"], horizontal=True)
    
    if st.button("Generar Reporte"):
        if len(df) == 0:
            st.warning("No hay datos para generar el reporte con los filtros actuales")
            return
            
        # Usar los mismos datos del DataFrame para el reporte
        datos_reporte = [tuple(x) for x in df.values]
        
        bytes_data = generar_reporte(
            datos_reporte, 
            columnas,  # Usar las mismas columnas definidas anteriormente
            formato.lower(),
            f"Reporte de Egresos {fecha_inicio.strftime('%d/%m/%Y')} - {fecha_fin.strftime('%d/%m/%Y')}"
        )
        
        extension = "xlsx" if formato == "Excel" else "pdf"
        crear_boton_descarga(
            bytes_data, 
            f"reporte_egresos_{fecha_inicio.strftime('%Y%m%d')}_{fecha_fin.strftime('%Y%m%d')}.{extension}", 
            f"⬇️ Descargar Reporte {formato}"
        )

def vista_administracion(db: DatabaseManager):
    st.header("⚙️ Panel de Administración")
    
    # Solo permitir acceso a administradores
    if st.session_state.usuario[3] != "admin":
        st.warning("🔒 No tienes permisos para acceder a esta sección")
        return

    # Crear nuevo usuario
    with st.expander("➕ Crear nuevo usuario", expanded=False):
        with st.form("form_nuevo_usuario", clear_on_submit=True):
            nuevo_usuario = st.text_input("Nombre de usuario*")
            nueva_contrasena = st.text_input("Contraseña*", type="password")
            # Nuevos roles disponibles
            roles_disponibles = ["admin", "editor", "visor"]
            rol = st.selectbox("Rol*", roles_disponibles)
            
            if st.form_submit_button("Crear usuario"):
                if not nuevo_usuario or not nueva_contrasena:
                    st.error("Los campos marcados con * son obligatorios")
                else:
                    try:
                        hash_pwd = hashlib.sha256(nueva_contrasena.encode()).hexdigest()
                        db.execute(
                            "INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, ?)",
                            (nuevo_usuario, hash_pwd, rol),
                            fetch=False
                        )
                        db.commit()
                        st.success("Usuario creado exitosamente!")
                        st.rerun()
                    except sqlite3.IntegrityError:
                        st.error("El nombre de usuario ya existe")
                    except Exception as e:
                        st.error(f"Error al crear usuario: {e}")

    st.divider()
    st.markdown("### 👥 Usuarios registrados")

    usuarios = db.execute("SELECT id, username, rol FROM usuarios ORDER BY username")
    
    if not usuarios:
        st.info("No hay usuarios registrados")
        return

    for user in usuarios:
        user_id, username, rol = user
        
        cols = st.columns([3, 2, 2, 2])
        cols[0].markdown(f"**{username}** (`{rol}`)")
        
        # Solo permitir acciones para usuarios no administradores
        if username != "admin":
            with cols[1]:
                # Selectbox para cambiar roles
                nuevo_rol = st.selectbox(
                    "Cambiar rol",
                    ["admin", "editor", "visor"],
                    index=["admin", "editor", "visor"].index(rol),
                    key=f"rol_{user_id}"
                )
                
                if nuevo_rol != rol:
                    if st.button("💾 Guardar", key=f"guardar_rol_{user_id}"):
                        try:
                            db.execute(
                                "UPDATE usuarios SET rol = ? WHERE id = ?",
                                (nuevo_rol, user_id),
                                fetch=False
                            )
                            db.commit()
                            st.success(f"Rol de {username} actualizado a {nuevo_rol}")
                            st.rerun()
                        except Exception as e:
                            st.error(f"Error al actualizar rol: {e}")
            
            with cols[2]:
                if st.button("❌ Eliminar", key=f"btn_eliminar_{user_id}"):
                    st.session_state.usuario_a_eliminar = user_id
            
            if st.session_state.get('usuario_a_eliminar') == user_id:
                with st.form(f"form_confirmar_eliminacion_{user_id}"):
                    st.warning(f"¿Confirmas que deseas eliminar al usuario {username}?")
                    password = st.text_input("Ingresa tu contraseña de administrador:", 
                                           type="password",
                                           key=f"pwd_confirm_{user_id}")
                    
                    if st.form_submit_button("✅ Confirmar eliminación"):
                        usuario_actual = st.session_state.usuario
                        if hashlib.sha256(password.encode()).hexdigest() == usuario_actual[2]:
                            try:
                                db.execute("DELETE FROM usuarios WHERE id = ?", (user_id,), fetch=False)
                                db.commit()
                                st.success(f"Usuario {username} eliminado correctamente")
                                del st.session_state.usuario_a_eliminar
                                st.rerun()
                            except Exception as e:
                                st.error(f"Error al eliminar usuario: {e}")
                        else:
                            st.error("Contraseña incorrecta")
        else:
            cols[1].write("🔒 Administrador principal")
            cols[2].write("🔒 No se puede eliminar")

def vista_detalle_nino(db: DatabaseManager):
    nino_id = st.session_state.detalle_id
    nino = db.execute("SELECT * FROM ninos WHERE id = ?", (nino_id,))
    
    if not nino:
        st.error("Niño no encontrado")
        st.session_state.pagina = "principal"
        st.rerun()
    
    nino = nino[0]
    st.header(f"👶 Detalle de {nino[1]}")
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"""
            **Cédula:** {nino[2]}  
            **Edad:** {nino[9]} años  
            **Grupo:** {nino[12]}  
            **Programa:** {nino[13]}  
            **Fecha nacimiento:** {nino[10].strftime('%d/%m/%Y')}  
            **Domicilio:** {nino[11] or 'No especificado'}
        """)
    with col2:
        st.markdown(f"""
            **Encargado 1:** {nino[3]}  
            **Teléfono:** {nino[4]}  
            **Encargado 2:** {nino[5] or 'No especificado'}  
            **Teléfono 2:** {nino[6] or 'No especificado'}  
            **Correo:** {nino[7] or 'No especificado'}  
            **Alergias:** {nino[8] or 'Ninguna'}
        """)
    
    st.divider()
    st.subheader("📅 Asistencias recientes")
    asistencias = db.execute(
        """SELECT fecha, presente FROM asistencias 
           WHERE nino_id = ? 
           ORDER BY fecha DESC LIMIT 30""",
        (nino_id,)
    )
    
    if asistencias:
        df_asistencias = pd.DataFrame(asistencias, columns=["Fecha", "Presente"])
        df_asistencias["Estado"] = df_asistencias["Presente"].apply(lambda x: "✅ Presente" if x else "❌ Ausente")
        st.dataframe(df_asistencias[["Fecha", "Estado"]], hide_index=True)
    else:
        st.info("No hay registros de asistencia recientes")
    
    if st.button("← Volver"):
        st.session_state.pagina = "principal"
        del st.session_state.detalle_id
        st.rerun()

# --- Función principal ---
def main():
    setup_ui()
    db = DatabaseManager()
    setup_autenticacion(db)
    
    menu = mostrar_menu()
    
    if st.session_state.get('pagina') == "detalle":
        vista_detalle_nino(db)
    elif menu == "Registro de Niños":
        vista_ninos(db)
    elif menu == "Control de Asistencias":
        vista_asistencias(db)
    elif menu == "Egreso de Niños":
        vista_egresos(db)
    elif menu == "Historial de Egresos":
        vista_historial_egresos(db)
    elif menu == "Administración" and st.session_state.usuario[3] == "admin":
        vista_administracion(db)
    else:
        st.warning("No tienes permisos para acceder a esta sección")
    
    db.close()

if __name__ == "__main__":
    main()