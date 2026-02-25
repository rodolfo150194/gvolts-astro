-- Script para poblar la tabla contacts con datos de prueba
-- Distribuidos en diferentes meses del año 2024-2025
-- Diferentes servicios y tipos de clientes

-- Limpiar datos existentes (opcional, comentar si no quieres eliminar)
-- TRUNCATE TABLE contacts;

-- Enero 2024 - Inicio de año, proyectos de renovación
INSERT INTO contacts (name, email, phone, service, zip, company, address, subject, message, created_at)
VALUES
('Carlos Mendoza', 'cmendoza@empresa.com', '+1 (305) 234-5678', 'fire-alarm', '33101', 'Tech Solutions Inc', 'Calle Principal 123, Miami', 'Renovación de sistema de detección', 'Necesitamos actualizar nuestro sistema de detección de incendios en nuestra oficina de 5 pisos. Actualmente tenemos un sistema antiguo de hace 15 años.', '2024-01-15 10:30:00'),

('Maria Rodriguez', 'mrodriguez@gmail.com', '+1 (786) 345-6789', 'security', '33125', NULL, 'Av. Coral 456, Coral Gables', 'Instalación de cámaras residencial', 'Hola, acabo de comprar una casa y me gustaría instalar un sistema de videovigilancia completo con cámaras exteriores e interiores. ¿Pueden hacerme una cotización?', '2024-01-22 14:45:00'),

-- Febrero 2024 - Temporada alta comercial
('Roberto Santos', 'roberto.santos@store.com', '+1 (305) 456-7890', 'security', '33134', 'Miami Electronics Store', 'Centro Comercial Bay 789', 'Sistema integral de seguridad', 'Somos una tienda de electrónicos y necesitamos un sistema completo de seguridad: cámaras, alarmas y control de acceso para empleados. Presupuesto para 2000 sq ft.', '2024-02-08 09:15:00'),

('Ana Patricia Lopez', 'analopez@yahoo.com', '+1 (954) 567-8901', 'electricity', '33330', NULL, NULL, 'Instalación eléctrica casa nueva', 'Estamos construyendo nuestra casa y necesitamos cotización para toda la instalación eléctrica. 3 habitaciones, 2 baños, cocina y área de lavandería.', '2024-02-14 16:20:00'),

('Luis Fernando Garcia', 'lfgarcia@industrial.com', '+1 (305) 678-9012', 'fire-alarm', '33142', 'Garcia Manufacturing', 'Zona Industrial 321', 'Sistema contra incendios para planta', 'Nuestra planta industrial requiere un sistema de supresión de incendios. Tenemos áreas con químicos y maquinaria pesada. ¿Hacen evaluaciones de riesgo?', '2024-02-20 11:30:00'),

-- Marzo 2024 - Primavera, proyectos residenciales
('Jennifer Martinez', 'jen.martinez@outlook.com', '+1 (786) 789-0123', 'access-control', '33145', NULL, 'Residencial Sunset 555', 'Control de acceso para condominio', 'Soy presidenta de la junta directiva de nuestro condominio. Queremos instalar control de acceso con tarjetas en la entrada principal y el gimnasio.', '2024-03-05 13:45:00'),

('David Thompson', 'dthompson@hotel.com', '+1 (305) 890-1234', 'monitoring', '33139', 'Ocean View Hotel', 'Collins Ave 777', 'Monitoreo 24/7 para hotel', 'Necesitamos servicio de monitoreo 24/7 para nuestro hotel boutique de 50 habitaciones. Actualmente tenemos cámaras pero no monitoreo activo.', '2024-03-12 10:00:00'),

('Patricia Gomez', 'pgomez@school.edu', '+1 (786) 901-2345', 'fire-alarm', '33155', 'Colegio San Jose', 'Av. Educación 888', 'Sistema de alarmas para colegio', 'Somos un colegio privado con 500 estudiantes. Necesitamos instalar sistema de alarmas contra incendios y evacuación en 3 edificios. Proyecto para inicio del próximo año escolar.', '2024-03-18 15:30:00'),

-- Abril 2024 - Proyectos comerciales
('Miguel Angel Ruiz', 'maruiz@restaurant.com', '+1 (305) 012-3456', 'fire-alarm', '33130', 'La Parrilla Restaurant', 'Brickell Ave 999', 'Sistema de supresión para cocina', 'Somos un restaurante y necesitamos instalar sistema de supresión de incendios en la cocina. El departamento de bomberos nos está requiriendo actualización.', '2024-04-03 09:45:00'),

('Sandra Perez', 'sperez@fitness.com', '+1 (954) 123-4567', 'security', '33331', 'FitLife Gym', 'Commercial Blvd 1111', 'Cámaras y control de acceso gym', 'Gimnasio de 5000 sq ft. Necesitamos cámaras en áreas comunes y sistema de control de acceso biométrico para los miembros.', '2024-04-10 14:20:00'),

-- Mayo 2024 - Temporada de mantenimiento
('Eduardo Vargas', 'evargas@gmail.com', '+1 (786) 234-5678', 'maintenance', '33126', NULL, 'Residential Towers 1234', 'Mantenimiento sistema existente', 'Tengo sistema de alarma instalado hace 3 años y necesito servicio de mantenimiento preventivo. ¿Ofrecen contratos anuales?', '2024-05-07 11:15:00'),

('Carolina Diaz', 'cdiaz@medical.com', '+1 (305) 345-6789', 'fire-alarm', '33156', 'Clinica Salud Total', 'Medical Center 1456', 'Certificación sistema médico', 'Clínica médica necesita certificación anual de nuestro sistema de detección de incendios. También requerimos inspección de extintores.', '2024-05-15 10:30:00'),

-- Junio 2024 - Verano, proyectos residenciales
('Francisco Morales', 'fmorales@yahoo.com', '+1 (786) 456-7890', 'electricity', '33133', NULL, NULL, 'Instalación paneles solares', 'Estoy interesado en instalar paneles solares en mi casa. ¿Ustedes hacen la instalación eléctrica necesaria? Casa de 2500 sq ft.', '2024-06-05 16:45:00'),

('Isabella Torres', 'itorres@boutique.com', '+1 (305) 567-8901', 'security', '33140', 'Boutique Elegance', 'Lincoln Road 1789', 'Videovigilancia boutique', 'Boutique de ropa en Lincoln Road. Necesitamos 6 cámaras interiores con grabación en la nube y acceso desde smartphone.', '2024-06-12 13:20:00'),

-- Julio 2024 - Temporada lenta pero con proyectos importantes
('Andres Felipe Castro', 'afcastro@warehouse.com', '+1 (954) 678-9012', 'security', '33332', 'Castro Logistics', 'Industrial Park 2000', 'Seguridad para bodega logística', 'Bodega de 20,000 sq ft con operación 24/7. Necesitamos sistema completo de videovigilancia exterior e interior, con capacidad de grabación de 30 días.', '2024-07-08 09:30:00'),

('Monica Silva', 'msilva@office.com', '+1 (786) 789-0123', 'access-control', '33131', 'Silva & Associates Law', 'Brickell Key 2222', 'Control acceso oficina abogados', 'Oficina de abogados en piso 15. Necesitamos control de acceso con tarjetas y registro de entrada/salida para 25 empleados. Datos sensibles requieren alta seguridad.', '2024-07-20 15:00:00'),

-- Agosto 2024 - Back to school, proyectos educativos
('Ricardo Jimenez', 'rjimenez@university.edu', '+1 (305) 890-1234', 'fire-alarm', '33174', 'Universidad Miami', 'Campus Central 3000', 'Actualización edificio universitario', 'Edificio de ciencias de la universidad necesita actualización completa del sistema de detección y alarma contra incendios. 4 pisos, laboratorios químicos.', '2024-08-06 11:45:00'),

('Valentina Ramirez', 'vramirez@daycare.com', '+1 (786) 901-2345', 'security', '33165', 'Little Angels Daycare', 'SW 8th St 3333', 'Seguridad para guardería', 'Guardería infantil con 60 niños. Necesitamos sistema de cámaras que permita a los padres ver a sus hijos en tiempo real. También control de acceso en entradas.', '2024-08-14 10:15:00'),

-- Septiembre 2024 - Preparación fin de año
('Gabriel Medina', 'gmedina@automotive.com', '+1 (305) 012-3456', 'security', '33166', 'AutoWorld Dealership', 'US 1 Highway 4000', 'Seguridad concesionario autos', 'Concesionario de autos de lujo. Necesitamos sistema de videovigilancia perimetral con detección de movimiento y alarma conectada a central. Lote con 100+ vehículos.', '2024-09-10 14:30:00'),

('Lucia Fernandez', 'lfernandez@pharmacy.com', '+1 (954) 123-4567', 'fire-alarm', '33334', 'Farmacia Vida', 'Main Street 4444', 'Sistema alarmas farmacia', 'Farmacia en proceso de apertura. Requerimos sistema de detección de incendios y alarma para cumplir con regulaciones estatales. 1500 sq ft.', '2024-09-18 09:00:00'),

-- Octubre 2024 - Temporada alta comercial
('Alejandro Suarez', 'asuarez@mall.com', '+1 (786) 234-5678', 'monitoring', '33172', 'Plaza Shopping Center', 'Mall Avenue 5000', 'Monitoreo centro comercial', 'Centro comercial con 50 locales. Queremos servicio de monitoreo 24/7 para sistema de cámaras existente. ¿Incluye respuesta a emergencias?', '2024-10-05 16:00:00'),

('Daniela Rojas', 'drojas@corporate.com', '+1 (305) 345-6789', 'electricity', '33178', 'Tech Corp', 'Corporate Drive 5555', 'Actualización eléctrica oficina', 'Oficina corporativa en proceso de remodelación. Necesitamos actualización completa del sistema eléctrico, iluminación LED y data center con respaldo eléctrico.', '2024-10-12 11:30:00'),

-- Noviembre 2024 - Fin de año, cierre de proyectos
('Fernando Ortiz', 'fortiz@events.com', '+1 (786) 456-7890', 'security', '33135', 'Events Paradise', 'Convention Center 6000', 'Seguridad salón de eventos', 'Salón de eventos para 500 personas. Necesitamos sistema de videovigilancia interior y exterior, más control de acceso en áreas VIP. Proyecto urgente.', '2024-11-08 13:45:00'),

('Camila Herrera', 'cherrera@realestate.com', '+1 (305) 567-8901', 'access-control', '33144', 'Herrera Properties', 'Real Estate Plaza 6666', 'Control acceso edificio oficinas', 'Edificio de oficinas de 10 pisos. Queremos implementar control de acceso con reconocimiento facial en lobby y elevadores. 200+ empleados.', '2024-11-15 10:20:00'),

-- Diciembre 2024 - Proyectos de cierre de año
('Javier Moreno', 'jmoreno@bank.com', '+1 (954) 678-9012', 'fire-alarm', '33335', 'Community Bank', 'Financial District 7000', 'Certificación sistema bancario', 'Sucursal bancaria necesita certificación anual y actualización de sistema de detección de incendios. Incluye bóveda y áreas de alto riesgo.', '2024-12-05 09:30:00'),

('Sofia Martinez', 'smartinez@spa.com', '+1 (786) 789-0123', 'other', '33149', 'Wellness Spa', 'Beach Road 7777', 'Consulta servicios integrales', 'Spa de lujo en proceso de apertura. Necesitamos cotización integral: alarmas contra incendios, cámaras de seguridad, control de acceso y sistema eléctrico especializado.', '2024-12-12 14:00:00'),

-- Enero 2025 - Nuevos proyectos año nuevo
('Antonio Vega', 'avega@construction.com', '+1 (305) 890-1234', 'electricity', '33150', 'Vega Construction', 'Builder Avenue 8000', 'Proyecto residencial múltiple', 'Constructora desarrollando 20 casas. Necesitamos cotización por volumen para instalación eléctrica completa en todas las unidades. Inicio febrero 2025.', '2025-01-10 11:00:00'),

('Paula Sandoval', 'psandoval@museum.org', '+1 (786) 901-2345', 'security', '33132', 'Museo de Arte', 'Cultural District 8888', 'Seguridad museo de arte', 'Museo con colección de arte valuada en millones. Necesitamos sistema de seguridad de alta tecnología: cámaras 4K, detección de movimiento, alarmas silenciosas y monitoreo 24/7.', '2025-01-18 15:30:00');

-- Verificar datos insertados
SELECT
    service,
    COUNT(*) as cantidad,
    TO_CHAR(MIN(created_at), 'YYYY-MM') as primer_contacto,
    TO_CHAR(MAX(created_at), 'YYYY-MM') as ultimo_contacto
FROM contacts
GROUP BY service
ORDER BY cantidad DESC;

-- Estadísticas por mes
SELECT
    TO_CHAR(created_at, 'YYYY-MM') as mes,
    COUNT(*) as total_contactos,
    COUNT(DISTINCT service) as servicios_diferentes
FROM contacts
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mes;
