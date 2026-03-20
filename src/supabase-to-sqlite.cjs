const { db, closeDatabase } = require('./models/database.cjs');

const SUPABASE_URL = "https://rydanxzqqvqokjeekwct.supabase.co";
const SUPABASE_KEY = "sb_publishable_C_SXa1_yAFuRnWijJUNt6w_0JnaAxC9";

const migrate = async () => {
    console.log('Fetching applications from Supabase...');
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Supabase fetch failed: ${err}`);
        }

        const supabaseApps = await response.json();
        console.log(`Found ${supabaseApps.length} applications in Supabase.`);

        if (supabaseApps.length === 0) {
            console.log('No applications to migrate.');
            closeDatabase();
            return;
        }

        db.serialize(() => {
            const stmt = db.prepare(`
                INSERT OR REPLACE INTO applications (
                    application_id, first_name, last_name, email, mobile_phone, dob, gender,
                    home_address, city, contact_region, guardian_name, guardian_phone, relationship,
                    selected_programme, selected_combination, passport_photo_url, medical_conditions,
                    jhs_name, bece_index_number, jhs_year_completed, status, created_at, updated_at, submitted_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?
                )
            `);

            for (const app of supabaseApps) {
                console.log(`Migrating: ${app.full_name || app.first_name + ' ' + app.last_name}`);
                
                // Parse full_name if first_name/last_name are missing
                let firstName = app.first_name;
                let lastName = app.last_name;
                if (!firstName && app.full_name) {
                    const parts = app.full_name.split(' ');
                    firstName = parts[0];
                    lastName = parts.slice(1).join(' ');
                }

                stmt.run(
                    app.application_id_display || app.id, // application_id
                    firstName || 'N/A',
                    lastName || 'N/A',
                    app.email || 'N/A',
                    app.phone || app.mobile_phone || 'N/A',
                    app.date_of_birth || app.dob || '2000-01-01',
                    app.gender || 'Other',
                    app.address || app.home_address || 'N/A',
                    app.city_town || app.city || 'N/A',
                    app.region_state || app.contact_region || 'N/A',
                    app.guardian_name || 'N/A',
                    app.guardian_phone || 'N/A',
                    app.parent_relationship || app.relationship || 'N/A',
                    app.programme || app.selected_programme || 'N/A',
                    app.programme_name || app.selected_combination || 'N/A',
                    app.passport_photo_url || '',
                    app.medical_conditions || '',
                    app.jhs_name || 'N/A',
                    app.bece_index || app.bece_index_number || 'N/A',
                    app.year_of_completion || app.jhs_year_completed || 2025,
                    app.status || 'Submitted',
                    app.created_at || new Date().toISOString(),
                    app.updated_at || new Date().toISOString(),
                    app.submitted_at || app.application_date || new Date().toISOString()
                );
            }

            stmt.finalize(() => {
                console.log('Migration complete.');
                closeDatabase();
            });
        });

    } catch (err) {
        console.error('Migration error:', err);
        closeDatabase();
    }
};

migrate();
