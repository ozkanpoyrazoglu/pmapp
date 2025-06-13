// MongoDB Initialization Script

// Switch to the project_management database
db = db.getSiblingDB('project_management');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'full_name', 'hashed_password'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^.+@.+$',
          description: 'must be a valid email address and is required'
        },
        full_name: {
          bsonType: 'string',
          minLength: 2,
          description: 'must be a string with at least 2 characters and is required'
        },
        hashed_password: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        is_active: {
          bsonType: 'bool',
          description: 'must be a boolean'
        },
        created_at: {
          bsonType: 'date',
          description: 'must be a date'
        },
        updated_at: {
          bsonType: 'date',
          description: 'must be a date'
        }
      }
    }
  }
});

db.createCollection('projects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'owner'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1,
          description: 'must be a non-empty string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'must be a string'
        },
        owner: {
          bsonType: 'string',
          description: 'must be a string (email) and is required'
        },
        status: {
          enum: ['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'],
          description: 'must be a valid status'
        },
        team_members: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'must be an array of strings (emails)'
        },
        start_date: {
          bsonType: 'date',
          description: 'must be a date'
        },
        end_date: {
          bsonType: 'date',
          description: 'must be a date'
        },
        created_at: {
          bsonType: 'date',
          description: 'must be a date'
        },
        updated_at: {
          bsonType: 'date',
          description: 'must be a date'
        }
      }
    }
  }
});

db.createCollection('tasks', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'project_id', 'created_by'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1,
          description: 'must be a non-empty string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'must be a string'
        },
        project_id: {
          bsonType: 'objectId',
          description: 'must be an ObjectId and is required'
        },
        created_by: {
          bsonType: 'string',
          description: 'must be a string (email) and is required'
        },
        task_type: {
          enum: ['task', 'epic', 'milestone'],
          description: 'must be a valid task type'
        },
        status: {
          enum: ['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'],
          description: 'must be a valid status'
        },
        priority: {
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'must be a valid priority'
        },
        completion_percentage: {
          bsonType: 'number',
          minimum: 0,
          maximum: 100,
          description: 'must be a number between 0 and 100'
        },
        assigned_to: {
          bsonType: 'string',
          description: 'must be a string (email)'
        },
        dependencies: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'must be an array of strings (task IDs)'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'must be an array of strings'
        },
        start_date: {
          bsonType: 'date',
          description: 'must be a date'
        },
        end_date: {
          bsonType: 'date',
          description: 'must be a date'
        },
        duration_days: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a positive number'
        },
        effort_hours: {
          bsonType: 'number',
          minimum: 0,
          description: 'must be a positive number'
        },
        created_at: {
          bsonType: 'date',
          description: 'must be a date'
        },
        updated_at: {
          bsonType: 'date',
          description: 'must be a date'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ 'email': 1 }, { unique: true });
db.users.createIndex({ 'created_at': 1 });

db.projects.createIndex({ 'owner': 1 });
db.projects.createIndex({ 'team_members': 1 });
db.projects.createIndex({ 'status': 1 });
db.projects.createIndex({ 'created_at': 1 });
db.projects.createIndex({ 'updated_at': 1 });

db.tasks.createIndex({ 'project_id': 1 });
db.tasks.createIndex({ 'created_by': 1 });
db.tasks.createIndex({ 'status': 1 });
db.tasks.createIndex({ 'task_type': 1 });
db.tasks.createIndex({ 'priority': 1 });
db.tasks.createIndex({ 'assigned_to': 1 });
db.tasks.createIndex({ 'parent_epic': 1 });
db.tasks.createIndex({ 'tags': 1 });
db.tasks.createIndex({ 'start_date': 1 });
db.tasks.createIndex({ 'end_date': 1 });
db.tasks.createIndex({ 'created_at': 1 });
db.tasks.createIndex({ 'updated_at': 1 });

// Compound indexes for common queries
db.tasks.createIndex({ 'project_id': 1, 'status': 1 });
db.tasks.createIndex({ 'project_id': 1, 'task_type': 1 });
db.tasks.createIndex({ 'project_id': 1, 'assigned_to': 1 });

print('MongoDB initialized successfully with collections and indexes');

// Create a demo user (password: demo123 - bcrypt hash)
db.users.insertOne({
  email: 'demo@example.com',
  full_name: 'Demo User',
  hashed_password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6KlCB.SGNO',
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
});

print('Demo user created - email: demo@example.com, password: demo123');