// mongo-init.js
// MongoDB initialization script - Demo data ve koleksiyonlar oluşturur
// Bu dosya MongoDB container'ı ilk başlatıldığında çalışır

print('=== MongoDB Initialization Started ===');

// Database'e geç
db = db.getSiblingDB('project_management');

print('Switched to project_management database');

// Koleksiyonları oluştur ve indexler ekle
try {
    // Users koleksiyonu
    db.createCollection('users');
    db.users.createIndex({ email: 1 }, { unique: true });
    print('✅ Users collection and index created');
    
    // Projects koleksiyonu
    db.createCollection('projects');
    db.projects.createIndex({ owner: 1 });
    db.projects.createIndex({ team_members: 1 });
    db.projects.createIndex({ created_at: -1 });
    print('✅ Projects collection and indexes created');
    
    // Tasks koleksiyonu
    db.createCollection('tasks');
    db.tasks.createIndex({ project_id: 1 });
    db.tasks.createIndex({ created_by: 1 });
    db.tasks.createIndex({ assigned_to: 1 });
    db.tasks.createIndex({ status: 1 });
    db.tasks.createIndex({ created_at: -1 });
    print('✅ Tasks collection and indexes created');
    
} catch (e) {
    print('❌ Error creating collections/indexes:', e.message);
}

print('=== Collections and Indexes Setup Complete ===');

// Demo kullanıcı oluştur
print('=== Creating Demo User ===');

try {
    // Önce mevcut demo kullanıcıyı kontrol et
    const existingUser = db.users.findOne({ email: 'demo@example.com' });
    
    if (existingUser) {
        print('ℹ️ Demo user already exists - skipping creation');
    } else {
        // Demo kullanıcı oluştur
        // Şifre: demo123 (bcrypt hash)
        const demoUser = {
            email: 'demo@example.com',
            full_name: 'Demo User',
            hashed_password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6KlCB.SGNO',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        };
        
        const userResult = db.users.insertOne(demoUser);
        print('✅ Demo user created successfully');
        print('   📧 Email: demo@example.com');
        print('   🔑 Password: demo123');
        print('   🆔 User ID:', userResult.insertedId.toString());
    }
} catch (e) {
    print('❌ Error creating demo user:', e.message);
}

// Demo projeler oluştur
print('=== Creating Demo Projects ===');

try {
    const demoUser = db.users.findOne({ email: 'demo@example.com' });
    
    if (!demoUser) {
        print('❌ Demo user not found - cannot create projects');
    } else {
        // Mevcut projeleri kontrol et
        const existingProjects = db.projects.countDocuments({ owner: 'demo@example.com' });
        
        if (existingProjects > 0) {
            print('ℹ️ Demo projects already exist - skipping creation');
        } else {
            print('Creating demo projects...');
            
            // Proje 1: Website Yenileme
            const project1 = {
                name: 'Website Yenileme Projesi',
                description: 'Şirket websitesini modern teknolojilerle yeniden tasarlama ve geliştirme projesi. Responsive tasarım, SEO optimizasyonu ve performans iyileştirmeleri içerir.',
                owner: 'demo@example.com',
                status: 'in_progress',
                team_members: ['demo@example.com'],
                settings: {
                    notifications: true,
                    public_visibility: false
                },
                created_at: new Date(),
                updated_at: new Date(),
                start_date: new Date('2024-01-01'),
                end_date: new Date('2024-06-30')
            };

            // Proje 2: Mobil Uygulama
            const project2 = {
                name: 'Mobil Uygulama Geliştirme',
                description: 'Cross-platform mobil uygulama geliştirme projesi. iOS ve Android platformları için React Native kullanılacak.',
                owner: 'demo@example.com',
                status: 'not_started',
                team_members: ['demo@example.com'],
                settings: {
                    notifications: true,
                    public_visibility: false
                },
                created_at: new Date(),
                updated_at: new Date(),
                start_date: new Date('2024-07-01'),
                end_date: new Date('2024-12-31')
            };

            // Proje 3: API Geliştirme
            const project3 = {
                name: 'Backend API Sistemi',
                description: 'Mikroservis mimarisi ile RESTful API geliştirme. FastAPI, MongoDB ve Docker teknolojileri kullanılacak.',
                owner: 'demo@example.com',
                status: 'completed',
                team_members: ['demo@example.com'],
                settings: {
                    notifications: false,
                    public_visibility: true
                },
                created_at: new Date('2023-06-01'),
                updated_at: new Date(),
                start_date: new Date('2023-06-01'),
                end_date: new Date('2023-12-15')
            };

            // Projeleri veritabanına ekle
            const project1Result = db.projects.insertOne(project1);
            const project2Result = db.projects.insertOne(project2);
            const project3Result = db.projects.insertOne(project3);

            print('✅ Created project 1:', project1.name, '- ID:', project1Result.insertedId.toString());
            print('✅ Created project 2:', project2.name, '- ID:', project2Result.insertedId.toString());
            print('✅ Created project 3:', project3.name, '- ID:', project3Result.insertedId.toString());

            // Demo görevleri oluştur
            print('=== Creating Demo Tasks ===');

            const tasks = [
                // Website Yenileme Projesi Görevleri
                {
                    name: 'Ana Sayfa Tasarımı',
                    description: 'Modern ve kullanıcı dostu ana sayfa tasarımı. Wireframe, mockup ve prototype aşamaları dahil.',
                    project_id: project1Result.insertedId,
                    created_by: 'demo@example.com',
                    task_type: 'task',
                    status: 'completed',
                    priority: 'high',
                    completion_percentage: 100,
                    assigned_to: 'demo@example.com',
                    dependencies: [],
                    tags: ['design', 'frontend', 'ui'],
                    custom_fields: {},
                    created_at: new Date('2024-01-05'),
                    updated_at: new Date(),
                    start_date: new Date('2024-01-05'),
                    end_date: new Date('2024-01-15'),
                    duration_days: 8,
                    effort_hours: 32
                },
                {
                    name: 'Veritabanı Migrasyonu',
                    description: 'Mevcut MySQL veritabanından MongoDB\'ye geçiş. Veri integrity kontrolü ve backup stratejisi.',
                    project_id: project1Result.insertedId,
                    created_by: 'demo@example.com',
                    task_type: 'task',
                    status: 'in_progress',
                    priority: 'critical',
                    completion_percentage: 75,
                    assigned_to: 'demo@example.com',
                    dependencies: [],
                    tags: ['backend', 'database', 'migration'],
                    custom_fields: {
                        estimated_records: 50000,
                        backup_size: '2.5GB'
                    },
                    created_at: new Date('2024-01-10'),
                    updated_at: new Date(),
                    start_date: new Date('2024-01-20'),
                    duration_days: 12,
                    effort_hours: 48
                },
                {
                    name: 'Frontend Framework Kurulumu',
                    description: 'React.js, TypeScript ve Tailwind CSS kurulumu. Development environment configuration.',
                    project_id: project1Result.insertedId,
                    created_by: 'demo@example.com',
                    task_type: 'task',
                    status: 'completed',
                    priority: 'medium',
                    completion_percentage: 100,
                    assigned_to: 'demo@example.com',
                    dependencies: [],
                    tags: ['frontend', 'setup', 'react'],
                    custom_fields: {},
                    created_at: new Date('2024-01-01'),
                    updated_at: new Date(),
                    start_date: new Date('2024-01-01'),
                    end_date: new Date('2024-01-03'),
                    duration_days: 3,
                    effort_hours: 12
                },
                {
                    name: 'API Endpoint\'leri Geliştirme',
                    description: 'Kullanıcı yönetimi, içerik yönetimi ve dosya yükleme API\'lerinin geliştirilmesi.',
                    project_id: project1Result.insertedId,
                    created_by: 'demo@example.com',
                    task_type: 'epic',
                    status: 'not_started',
                    priority: 'high',
                    completion_percentage: 0,
                    assigned_to: 'demo@example.com',
                    dependencies: [],
                    tags: ['backend', 'api', 'development'],
                    custom_fields: {
                        endpoint_count: 15,
                        authentication: 'JWT'
                    },
                    created_at: new Date(),
                    updated_at: new Date(),
                    duration_days: 20,
                    effort_hours: 80
                },
                {
                    name: 'SEO Optimizasyonu',
                    description: 'Meta tags, sitemap, robots.txt ve Core Web Vitals optimizasyonu.',
                    project_id: project1Result.insertedId,
                    created_by: 'demo@example.com',
                    task_type: 'task',
                    status: 'not_started',
                    priority: 'medium',
                    completion_percentage: 0,
                    assigned_to: 'demo@example.com',
                    dependencies: [],
                    tags: ['seo', 'optimization', 'marketing'],
                    custom_fields: {},
                    created_at: new Date(),
                    updated_at: new Date(),
                    duration_days: 5,
                    effort_hours: 20
                },

                // Mobil Uygulama Projesi Görevleri
                {
                    name: 'Mobil Uygulama Mimarisi',
                    description: 'React Native app architecture planning ve teknoloji stack belirleme.',
                    project_id: project2Result.insertedId,
                    created_by: 'demo@example.com',
                    task_type: 'milestone',
                    status: 'not_started',
                    priority: 'critical',
                    completion_percentage: 0,
                    assigned_to: 'demo@example.com',
                    dependencies: [],
                    tags: ['architecture', 'mobile', 'planning'],
                    custom_fields: {
                        target_platforms: ['iOS', 'Android'],
                        min_version: 'iOS 13, Android 8'
                    },
                    created_at: new Date(),
                    updated_at: new Date(),
                    duration_days: 7,
                    effort_hours: 28
                },
                {
                    name: 'UI/UX Tasarım Süreci',
                    description: 'User research, wireframes, prototypes ve design system oluşturma.',
                    project_id: project2Result.insertedId,
                    created_by: 'demo@example.com',
                    task_type: 'epic',
                    status: 'not_started',
                    priority: 'high',
                    completion_percentage: 0,
                    assigned_to: 'demo@example.com',
                    dependencies: [],
                    tags: ['design', 'ux', 'research'],
                    custom_fields: {},
                    created_at: new Date(),
                    updated_at: new Date(),
                    duration_days: 14,
                    effort_hours: 56
                },

                // API Sistemi Projesi Görevleri (Tamamlanmış)
                {
                    name: 'Mikroservis Mimarisi Kurulumu',
                    description: 'Docker containers, API Gateway ve service discovery configuration.',
                    project_id: project3Result.insertedId,
                    created_by: 'demo@example.com',
                    task_type: 'milestone',
                    status: 'completed',
                    priority: 'critical',
                    completion_percentage: 100,
                    assigned_to: 'demo@example.com',
                    dependencies: [],
                    tags: ['microservices', 'docker', 'architecture'],
                    custom_fields: {
                        service_count: 5,
                        load_balancer: 'nginx'
                    },
                    created_at: new Date('2023-06-01'),
                    updated_at: new Date('2023-07-15'),
                    start_date: new Date('2023-06-01'),
                    end_date: new Date('2023-07-15'),
                    duration_days: 30,
                    effort_hours: 120
                },
                {
                    name: 'API Documentation',
                    description: 'OpenAPI/Swagger documentation ve developer portal oluşturma.',
                    project_id: project3Result.insertedId,
                    created_by: 'demo@example.com',
                    task_type: 'task',
                    status: 'completed',
                    priority: 'medium',
                    completion_percentage: 100,
                    assigned_to: 'demo@example.com',
                    dependencies: [],
                    tags: ['documentation', 'swagger', 'api'],
                    custom_fields: {},
                    created_at: new Date('2023-10-01'),
                    updated_at: new Date('2023-11-01'),
                    start_date: new Date('2023-10-01'),
                    end_date: new Date('2023-11-01'),
                    duration_days: 15,
                    effort_hours: 30
                }
            ];

            // Görevleri veritabanına ekle
            const tasksResult = db.tasks.insertMany(tasks);
            print('✅ Created', tasksResult.insertedIds.length, 'demo tasks');
            
            // Task ID'lerini yazdır
            Object.values(tasksResult.insertedIds).forEach((taskId, index) => {
                print('   - Task', (index + 1) + ':', tasks[index].name, '- ID:', taskId.toString());
            });
        }
    }
} catch (e) {
    print('❌ Error creating demo projects/tasks:', e.message);
}

// Koleksiyon istatistiklerini yazdır
print('=== Database Statistics ===');
try {
    const usersCount = db.users.countDocuments();
    const projectsCount = db.projects.countDocuments();
    const tasksCount = db.tasks.countDocuments();
    
    print('📊 Collections Summary:');
    print('   👥 Users:', usersCount);
    print('   📁 Projects:', projectsCount);
    print('   ✅ Tasks:', tasksCount);
    
    // İndex bilgilerini yazdır
    print('📇 Indexes Created:');
    print('   Users indexes:', db.users.getIndexes().length);
    print('   Projects indexes:', db.projects.getIndexes().length);
    print('   Tasks indexes:', db.tasks.getIndexes().length);
    
} catch (e) {
    print('❌ Error getting statistics:', e.message);
}

print('=== MongoDB Initialization Complete ===');
print('🎉 Database is ready for use!');
print('');
print('👤 Demo Login Credentials:');
print('   📧 Email: demo@example.com');
print('   🔑 Password: demo123');
print('');
print('🌐 Frontend: http://localhost:3000');
print('📡 Backend API: http://localhost:8000');
print('📚 API Docs: http://localhost:8000/docs');
print('');
print('Happy coding! 🚀');