// Configuration loader for Airtable credentials
// Supports environment variables and local config files

// Default configuration (fallback)
const DEFAULT_CONFIG = {
    ACCESS_TOKEN: '',
    BASE_ID: '',
    PROJECTS_TABLE: 'Projects',
    PROJECTS_VIEW: 'Grid view',
    MEDIA_TABLE: 'Media Assets',
    EXHIBITIONS_TABLE: 'Exhibitions',
    COLLABORATORS_TABLE: 'Collaborators',
    WORKSHOPS_TABLE: 'Workshops & Talks'
};

// Load environment variables (if available)
function loadFromEnv() {
    // This would work in Node.js environment
    if (typeof process !== 'undefined' && process.env) {
        return {
            ACCESS_TOKEN: process.env.AIRTABLE_API_TOKEN,
            BASE_ID: process.env.AIRTABLE_BASE_ID,
            PROJECTS_TABLE: process.env.AIRTABLE_PROJECTS_TABLE || 'Projects',
            PROJECTS_VIEW: process.env.AIRTABLE_PROJECTS_VIEW || 'Grid view',
            MEDIA_TABLE: process.env.AIRTABLE_MEDIA_TABLE || 'Media Assets',
            EXHIBITIONS_TABLE: process.env.AIRTABLE_EXHIBITIONS_TABLE || 'Exhibitions',
            COLLABORATORS_TABLE: process.env.AIRTABLE_COLLABORATORS_TABLE || 'Collaborators',
            WORKSHOPS_TABLE: process.env.AIRTABLE_WORKSHOPS_TABLE || 'Workshops & Talks'
        };
    }
    return null;
}

// Load from local config file (for client-side development)
async function loadFromLocalConfig() {
    try {
        // Skip fetching local config in production environments
        if (typeof window !== 'undefined') {
            const host = window.location.hostname;
            const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
            if (!isLocalhost) {
                // Try optional production config file if provided by hosting
                try {
                    const prodResponse = await fetch('config/env.production');
                    if (prodResponse.ok) {
                        const text = await prodResponse.text();
                        const parsed = {};
                        text.split('\n').forEach(line => {
                            line = line.trim();
                            if (line && !line.startsWith('#')) {
                                const [key, ...valueParts] = line.split('=');
                                const value = valueParts.join('=');
                                switch(key) {
                                    case 'AIRTABLE_API_TOKEN': parsed.ACCESS_TOKEN = value; break;
                                    case 'AIRTABLE_BASE_ID': parsed.BASE_ID = value; break;
                                    case 'AIRTABLE_PROJECTS_TABLE': parsed.PROJECTS_TABLE = value; break;
                                    case 'AIRTABLE_PROJECTS_VIEW': parsed.PROJECTS_VIEW = value; break;
                                    case 'AIRTABLE_MEDIA_TABLE': parsed.MEDIA_TABLE = value; break;
                                    case 'AIRTABLE_EXHIBITIONS_TABLE': parsed.EXHIBITIONS_TABLE = value; break;
                                    case 'AIRTABLE_COLLABORATORS_TABLE': parsed.COLLABORATORS_TABLE = value; break;
                                    case 'AIRTABLE_WORKSHOPS_TABLE': parsed.WORKSHOPS_TABLE = value; break;
                                }
                            }
                        });
                        return parsed;
                    }
                } catch (_) { /* ignore */ }
                return null;
            }
        }

        const response = await fetch('config/env.local');
        if (!response.ok) throw new Error('Config file not found');
        
        const text = await response.text();
        const config = {};
        
        // Parse simple key=value format
        text.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=');
                
                switch(key) {
                    case 'AIRTABLE_API_TOKEN':
                        config.ACCESS_TOKEN = value;
                        break;
                    case 'AIRTABLE_BASE_ID':
                        config.BASE_ID = value;
                        break;
                    case 'AIRTABLE_PROJECTS_TABLE':
                        config.PROJECTS_TABLE = value;
                        break;
                    case 'AIRTABLE_PROJECTS_VIEW':
                        config.PROJECTS_VIEW = value;
                        break;
                    case 'AIRTABLE_MEDIA_TABLE':
                        config.MEDIA_TABLE = value;
                        break;
                    case 'AIRTABLE_EXHIBITIONS_TABLE':
                        config.EXHIBITIONS_TABLE = value;
                        break;
                    case 'AIRTABLE_COLLABORATORS_TABLE':
                        config.COLLABORATORS_TABLE = value;
                        break;
                    case 'AIRTABLE_WORKSHOPS_TABLE':
                        config.WORKSHOPS_TABLE = value;
                        break;
                }
            }
        });
        
        return config;
    } catch (error) {
        console.warn('Could not load local config file:', error.message);
        return null;
    }
}

// Main configuration loader
async function loadConfig() {
    // Try environment variables first
    const envConfig = loadFromEnv();
    if (envConfig && envConfig.ACCESS_TOKEN && envConfig.BASE_ID) {
        console.log('✅ Loaded config from environment variables');
        return { ...DEFAULT_CONFIG, ...envConfig };
    }
    
    // Try local config file
    const localConfig = await loadFromLocalConfig();
    if (localConfig && localConfig.ACCESS_TOKEN && localConfig.BASE_ID) {
        console.log('✅ Loaded config from local config file');
        return { ...DEFAULT_CONFIG, ...localConfig };
    }
    
    // Fallback to hardcoded (for backward compatibility)
    console.warn('⚠️ Using fallback configuration - update your config files!');
    return {
        ACCESS_TOKEN: 'patuh3Jlg71SRPHIb.679b821c7528d252101cdc7f40cc8ed0e44c7e3d9443c2505213f89501a7ad2c',
        BASE_ID: 'appy5PeLmP9YHhroy',
        PROJECTS_TABLE: 'Projects',
        PROJECTS_VIEW: 'Grid view',
        MEDIA_TABLE: 'Media Assets',
        EXHIBITIONS_TABLE: 'Exhibitions',
        COLLABORATORS_TABLE: 'Collaborators',
        WORKSHOPS_TABLE: 'Workshops & Talks'
    };
}

// Export for use in other files
window.loadAirtableConfig = loadConfig; 