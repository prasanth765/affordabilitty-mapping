const pinelabsEntriesDomElement = document.getElementById('pinelabs-entries');

if (pinelabsEntriesDomElement) {
    const posIdInputTemplate = pinelabsEntriesDomElement.querySelector('.pinelabs-entry input[name="pos_id"]');
    const initialPosIdRequired = posIdInputTemplate ? posIdInputTemplate.hasAttribute('required') : false;

    window.createPinelabsEntryHtml = (pos_id = '', tid = '', serial_no = '', store_id = '', includeRemoveButton = false, id = null) => {
        const displayId = id !== null ? `data-id="${id}"` : '';
        const currentEntries = pinelabsEntriesDomElement ? pinelabsEntriesDomElement.children.length : 0;
        const requiredAttribute = (currentEntries === 0 && pos_id === '' && initialPosIdRequired) ? 'required' : '';

        return `
            <div class="pinelabs-entry grid grid-cols-1-md-4 gap-md" ${displayId}>
                <div class="form-group mb-0">
                    <label class="hidden md:block">POS ID</label>
                    <input type="text" name="pos_id" placeholder="POS ID" class="form-control pinelabs-pos-id" value="${pos_id}" ${requiredAttribute}>
                </div>
                <div class="form-group mb-0">
                    <label class="hidden md:block">TID</label>
                    <input type="text" name="tid" placeholder="TID" class="form-control pinelabs-tid" value="${tid}">
                </div>
                <div class="form-group mb-0">
                    <label class="hidden md:block">Serial No</label>
                    <input type="text" name="serial_no" placeholder="Serial No" class="form-control pinelabs-serial-no" value="${serial_no}">
                </div>
                <div class="form-group mb-0" style="position: relative;">
                    <label class="hidden md:block">Store ID (PL)</label>
                    <input type="text" name="store_id" placeholder="Store ID" class="form-control pinelabs-store-id" value="${store_id}">
                    ${includeRemoveButton ? '<button type="button" class="btn-icon-only btn-delete-icon remove-pinelabs-entry" style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); border: none;"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>' : ''}
                </div>
            </div>
        `;
    };

    window.addPinelabsEntryWithRemoveButton = (pos_id = '', tid = '', serial_no = '', store_id = '') => {
        if (!pinelabsEntriesDomElement) return;
        pinelabsEntriesDomElement.insertAdjacentHTML('beforeend', window.createPinelabsEntryHtml(pos_id, tid, serial_no, store_id, true));
        window.checkAndAdjustRemoveButtons();
    };

    window.createEmptyPinelabsEntry = () => {
        if (!pinelabsEntriesDomElement) return;
        pinelabsEntriesDomElement.innerHTML = '';
        pinelabsEntriesDomElement.insertAdjacentHTML('beforeend', window.createPinelabsEntryHtml());
        window.checkAndAdjustRemoveButtons();
        if (initialPosIdRequired) {
            const firstPosInput = pinelabsEntriesDomElement.querySelector('.pinelabs-pos-id');
            if (firstPosInput) firstPosInput.setAttribute('required', 'true');
        }
    };

    window.checkAndAdjustRemoveButtons = () => {
        if (!pinelabsEntriesDomElement) return;
        const entries = pinelabsEntriesDomElement.children;
        const removeButtons = pinelabsEntriesDomElement.querySelectorAll('.remove-pinelabs-entry');
        if (entries.length <= 1) {
            removeButtons.forEach(btn => btn.style.display = 'none');
        } else {
            removeButtons.forEach(btn => btn.style.display = 'block');
        }
    };

    window.populatePinelabsTable = (tableBodyElement, pinelabsData, options = {}) => {
        const { editable = false, isAdminView = false } = options;
        if (!tableBodyElement) {
            console.error("Target table body for Pine Labs not found.");
            return;
        }

        const table = tableBodyElement.closest('table');
        if (table && table.tHead && table.tHead.rows[0]) {
             table.tHead.rows[0].innerHTML = `<th>PL ID</th><th>Mapping ID</th><th>Store Name</th><th>Brand</th><th>POS ID</th><th>TID</th><th>Serial No</th><th>Store ID (PL)</th><th class="table-actions-column">Actions</th>`;
        }

        tableBodyElement.innerHTML = '';
        const colspan = table?.tHead?.rows[0]?.cells.length || 9;

        if (pinelabsData && pinelabsData.length > 0) {
            pinelabsData.forEach(pl => {
                const tr = tableBodyElement.insertRow();
                const mainMappingId = pl.finance_mappings?.id || pl.mapping_id;
                let actionsCellHtml = `<td class="table-actions-column">-</td>`;

                if (editable) {
                    actionsCellHtml = `<td class="table-actions-column"><div class="action-buttons">`;
                    if (mainMappingId) {
                        actionsCellHtml += `<button class="btn btn-icon-only btn-edit-icon" onclick="window.editMapping(${mainMappingId})" title="Edit Main Mapping"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>`;
                    }
                    actionsCellHtml += `<button class="btn btn-icon-only btn-delete-icon" onclick="window.deleteSinglePinelabsDetail(${pl.id})" title="Delete Pine Labs Entry"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div></td>`;
                }
                const storeName = pl.finance_mappings?.store_name || '-';
                const brand = pl.finance_mappings?.brand || '-';
                const mappingIdDisplay = pl.mapping_id || 'N/A';
                tr.innerHTML = `
                    <td class="table-id-column">${pl.id || '-'}</td><td>${mappingIdDisplay}</td><td>${storeName}</td>
                    <td data-brand="${brand}">${brand}</td><td>${pl.pos_id || '-'}</td><td>${pl.tid || '-'}</td>
                    <td>${pl.serial_no || '-'}</td><td>${pl.store_id || '-'}</td>${actionsCellHtml}`;
            });
        } else {
            tableBodyElement.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">No Pine Labs details found.</td></tr>`;
        }
    };
    
    window.deleteSinglePinelabsDetail = async (detailId) => {
        if (!confirm('Delete this specific Pine Labs entry?')) return;
        try {
            const { data: { user } = { user: null } } = await window.supabaseClient.auth.getUser(); 
            if (!user) throw new Error('Authentication required.');

            const userRole = await window.checkUserRole();
            if (userRole !== 'admin') {
                const { data: detail, error: fetchErr } = await window.supabaseClient.from('pinelabs_details').select('mapping_id').eq('id', detailId).single();
                if (fetchErr || !detail) throw fetchErr || new Error("Detail not found");
                
                const { data: mapping, error: mapErr } = await window.supabaseClient.from('finance_mappings').select('user_id').eq('id', detail.mapping_id).single();
                if (mapErr || !mapping) throw mapErr || new Error("Associated mapping not found");

                if (mapping.user_id !== user.id) throw new Error('Permission denied.');
            }

            const { error } = await window.supabaseClient.from('pinelabs_details').delete().eq('id', detailId);
            if (error) throw error;
            
            window.showToast('Pine Labs entry deleted.', 'success');
            if (typeof window.loadMappings === 'function') await window.loadMappings();
            if (typeof window.refreshOverallTables === 'function') await window.refreshOverallTables();
        } catch (err) {
            window.showToast('Delete failed: ' + err.message, 'error');
        }
    };

    window.updatePineLabsDetails = async (mappingId, pineLabsDetailsArray) => {
        if (!mappingId) {
            window.showToast('Cannot update Pine Labs: Mapping ID missing.', 'error');
            return;
        }
        try {
            const { data: { user } = { user: null } } = await window.supabaseClient.auth.getUser(); 
            if (!user) {
                window.showToast('Authentication required to update Pine Labs details.', 'error');
                return;
            }

            const { data: existingDetailsDb } = await window.supabaseClient.from('pinelabs_details').select('id').eq('mapping_id', mappingId);
            const existingDbIds = new Set(existingDetailsDb?.map(d => d.id) || []);
            
            const detailsToUpdate = [];
            const detailsToInsert = [];

            pineLabsDetailsArray.forEach(plFromForm => {
                if (plFromForm.id !== null && existingDbIds.has(plFromForm.id)) { 
                    detailsToUpdate.push(plFromForm);
                } else {
                    detailsToInsert.push(plFromForm); 
                }
            });
            
            const idsInFormForUpdate = new Set(detailsToUpdate.map(pl => pl.id));
            const idsToDelete = Array.from(existingDbIds).filter(dbId => !idsInFormForUpdate.has(dbId));

            if (idsToDelete.length > 0) {
                const { error: delErr } = await window.supabaseClient.from('pinelabs_details').delete().in('id', idsToDelete);
                if (delErr) console.warn("Error deleting surplus PL details:", delErr.message);
            }

            if (detailsToInsert.length > 0) {
                const insertPayload = detailsToInsert.map(d => {
                    const { id, ...restOfDetail } = d; 
                    return {
                        ...restOfDetail,
                        mapping_id: mappingId,
                        user_id: user.id 
                    };
                });
                const { data: insertedData, error: insErr } = await window.supabaseClient.from('pinelabs_details').insert(insertPayload).select();
                if (insErr) {
                    console.error("Error inserting new PL details:", insErr, "Payload:", insertPayload);
                    window.showToast('Failed to insert PL entries: ' + insErr.message, 'error');
                }
            }

            for (const detail of detailsToUpdate) {
                const { id, mapping_id, user_id, ...updateObject } = detail; 
                const { error: updErr } = await window.supabaseClient.from('pinelabs_details')
                    .update(updateObject)
                    .eq('id', detail.id);
                if (updErr) console.warn(`Error updating PL detail ${detail.id}:`, updErr.message);
            }
        } catch (err) {
            window.showToast('Updating Pine Labs details failed catastrophically: ' + err.message, 'error');
            console.error("Full error in updatePineLabsDetails:", err);
        }
    };
} else {
    // Fallback if pinelabs-entries element is not found on DOM
    window.createPinelabsEntryHtml = () => '';
    window.addPinelabsEntryWithRemoveButton = () => window.showToast("PL form error.", "error");
    window.createEmptyPinelabsEntry = () => {};
    window.checkAndAdjustRemoveButtons = () => {};
    window.populatePinelabsTable = (el) => { if (el) el.innerHTML = '<tr><td colspan="9" class="empty-state">PL init failed.</td></tr>';};
    window.deleteSinglePinelabsDetail = () => window.showToast("PL delete unavailable.", "error");
    window.updatePineLabsDetails = () => window.showToast("PL update unavailable.", "error");
}