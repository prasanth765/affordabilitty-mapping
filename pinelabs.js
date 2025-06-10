const pinelabsEntriesDomElement = document.getElementById('pinelabs-entries');
const pinelabsSearchInput = document.getElementById('pinelabs-search-input');
let allPineLabsData = [];

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
        const removeButtons = pinelabsEntriesDomElement.querySelectorAll('.pinelabs-entry .remove-pinelabs-entry');
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

        allPineLabsData = Array.isArray(pinelabsData) ? pinelabsData : [];

        let dataToDisplay = allPineLabsData;
        const searchTerm = pinelabsSearchInput?.value?.toLowerCase().trim() || '';

        if (searchTerm !== '') {
             dataToDisplay = allPineLabsData.filter(pl => {
                 const searchString = [
                    String(pl.id || ''),
                    String(pl.mapping_id || ''),
                    String(pl.finance_mappings?.store_name || ''),
                    String(pl.finance_mappings?.brand || ''),
                    String(pl.pos_id || ''),
                    String(pl.tid || ''),
                    String(pl.serial_no || ''),
                    String(pl.store_id || '')
                ].join(' ').toLowerCase();
                return searchString.includes(searchTerm);
             });
        }

        tableBodyElement.innerHTML = '';
        const colspan = table?.tHead?.rows[0]?.cells.length || 9;

        if (dataToDisplay.length > 0) {
            dataToDisplay.forEach(pl => {
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
            tableBodyElement.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">${searchTerm ? 'No results found for your search.' : 'No Pine Labs details found.'}</td></tr>`;
        }
    };

     window.filterPineLabsTable = () => {
        const pinelabsTableBody = document.getElementById('pinelabs-table-body');
        if (!pinelabsTableBody) {
            console.error("Pinelabs table body not found for filtering.");
            return;
        }

        const searchTerm = pinelabsSearchInput?.value?.toLowerCase().trim() || '';
        let filteredData = [];

        if (searchTerm === '') {
            filteredData = allPineLabsData;
        } else {
             filteredData = allPineLabsData.filter(pl => {
                 const searchString = [
                    String(pl.id || ''),
                    String(pl.mapping_id || ''),
                    String(pl.finance_mappings?.store_name || ''),
                    String(pl.finance_mappings?.brand || ''),
                    String(pl.pos_id || ''),
                    String(pl.tid || ''),
                    String(pl.serial_no || ''),
                    String(pl.store_id || '')
                ].join(' ').toLowerCase();
                return searchString.includes(searchTerm);
             });
        }

         const tableBodyElement = document.getElementById('pinelabs-table-body');
         if (!tableBodyElement) {
             console.error("Pinelabs table body disappeared during filter render.");
             return;
         }
        tableBodyElement.innerHTML = '';
        const colspan = tableBodyElement.closest('table')?.tHead?.rows[0]?.cells.length || 9;


        if (filteredData.length > 0) {
            filteredData.forEach(pl => {
                const tr = tableBodyElement.insertRow();
                const editable = true; 

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
                    <td class="table-id-column">${pl.id || '-'}</td>
                    <td>${mappingIdDisplay}</td>
                    <td>${storeName}</td>
                    <td data-brand="${brand}">${brand}</td>
                    <td>${pl.pos_id || '-'}</td>
                    <td>${pl.tid || '-'}</td>
                    <td>${pl.serial_no || '-'}</td>
                    <td>${pl.store_id || '-'}</td>
                    ${actionsCellHtml}`;
            });
        } else {
            tableBodyElement.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">${searchTerm ? 'No results found for your search.' : 'No Pine Labs details found.'}</td></tr>`;
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

             const deletedIndex = allPineLabsData.findIndex(pl => pl.id === detailId);
             if (deletedIndex > -1) {
                  allPineLabsData.splice(deletedIndex, 1);
             }
             window.filterPineLabsTable();

            if (typeof window.loadMappings === 'function') await window.loadMappings();
            if (typeof window.refreshOverallTables === 'function') await window.refreshOverallTables();

        } catch (err) {
            window.showToast('Delete failed: ' + err.message, 'error');
             console.error("Full error in deleteSinglePinelabsDetail:", err);
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

            const { data: existingDetailsDb, error: fetchExistingErr } = await window.supabaseClient.from('pinelabs_details').select('id, pos_id, tid, serial_no, store_id, mapping_id').eq('mapping_id', mappingId);
             if (fetchExistingErr) throw fetchExistingErr;

            const existingDbMap = new Map(existingDetailsDb?.map(d => [d.id, d]) || []);

            const detailsToUpdate = [];
            const detailsToInsert = [];

            pineLabsDetailsArray.forEach(plFromForm => {
                 const isNewEntry = plFromForm.id === null || !existingDbMap.has(plFromForm.id);

                if (isNewEntry) {
                     const isMeaningfulEntry = (plFromForm.pos_id || plFromForm.tid || plFromForm.serial_no || plFromForm.store_id);
                     const isFirstRequiredEmptyEntry = initialPosIdRequired && pineLabsDetailsArray.length === 1 && pineLabsDetailsArray[0] === plFromForm && !isMeaningfulEntry;

                    if (initialPosIdRequired && !plFromForm.pos_id && isMeaningfulEntry) {
                         console.warn("Skipping insert/update of a Pine Labs entry due to missing required POS ID for a non-empty entry.");
                         window.showToast('Skipped saving a PL entry with missing required POS ID.', 'warning');
                         return;
                    }

                     if (isMeaningfulEntry || isFirstRequiredEmptyEntry) {
                         detailsToInsert.push(plFromForm);
                     } else {
                          console.log("Skipping empty or nearly empty PL entry insert.");
                     }


                } else if (plFromForm.id !== null && existingDbMap.has(plFromForm.id)) {
                     const existingDetail = existingDbMap.get(plFromForm.id);
                     const hasChanged = existingDetail.pos_id !== plFromForm.pos_id ||
                                       existingDetail.tid !== plFromForm.tid ||
                                       existingDetail.serial_no !== plFromForm.serial_no ||
                                       existingDetail.store_id !== plFromForm.store_id;
                     if (hasChanged) {
                        detailsToUpdate.push(plFromForm);
                     }
                }
            });

            const idsInFormForUpdateAndInsert = new Set(
                 pineLabsDetailsArray
                    .filter(d => d.id !== null && existingDbMap.has(d.id))
                    .map(d => d.id)
            );

            const idsToDelete = Array.from(existingDbMap.keys()).filter(dbId => !idsInFormForUpdateAndInsert.has(dbId));

            let hasError = false;

            if (idsToDelete.length > 0) {
                const { error: delErr } = await window.supabaseClient.from('pinelabs_details').delete().in('id', idsToDelete);
                if (delErr) {
                   console.warn("Error deleting surplus PL details:", delErr.message, delErr);
                   window.showToast("Error deleting old PL entries: " + delErr.message, 'error');
                   hasError = true;
                } else {
                    allPineLabsData = allPineLabsData.filter(pl => !idsToDelete.includes(pl.id));
                }
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
                const { data: insertedData, error: insErr } = await window.supabaseClient.from('pinelabs_details').insert(insertPayload).select('id, pos_id, tid, serial_no, store_id, mapping_id');
                if (insErr) {
                    console.error("Error inserting new PL details:", insErr, "Payload:", insertPayload);
                    window.showToast('Failed to insert new PL entries: ' + insErr.message, 'error');
                    hasError = true;
                } else if (insertedData && insertedData.length > 0) {
                     const insertedWithMappingInfo = insertedData.map(item => ({ ...item, finance_mappings: null }));
                     allPineLabsData = allPineLabsData.concat(insertedWithMappingInfo);
                      insertedData.forEach(item => idsInFormForUpdateAndInsert.add(item.id));
                }
            }

            for (const detail of detailsToUpdate) {
                const updateObject = {
                   pos_id: detail.pos_id,
                   tid: detail.tid,
                   serial_no: detail.serial_no,
                   store_id: detail.store_id,
                };
                 const { error: updErr } = await window.supabaseClient.from('pinelabs_details')
                    .update(updateObject)
                    .eq('id', detail.id)
                    .eq('mapping_id', mappingId);
                 if (updErr) {
                    console.warn(`Error updating PL detail ${detail.id}:`, updErr.message, updErr);
                    window.showToast(`Failed to update PL entry ${detail.id}: ${updErr.message}`, 'error');
                    hasError = true;
                 } else {
                     const index = allPineLabsData.findIndex(pl => pl.id === detail.id);
                    if (index > -1) {
                       allPineLabsData[index] = { ...allPineLabsData[index], ...updateObject };
                    }
                 }
            }

             window.filterPineLabsTable();

            if (!hasError) {
                window.showToast('Pine Labs details updated successfully.', 'success');
            }

             if (typeof window.loadMappings === 'function') {
                await window.loadMappings();
             }
            if (typeof window.refreshOverallTables === 'function') await window.refreshOverallTables();

        } catch (err) {
            window.showToast('Updating Pine Labs details failed: ' + err.message, 'error');
            console.error("Full error in updatePineLabsDetails:", err);
        }
    };

    if (pinelabsSearchInput) {
        pinelabsSearchInput.addEventListener('input', window.filterPineLabsTable);
    }

} else {
    console.warn("Element with id 'pinelabs-entries' not found. PineLabs entry functionality limited.");
    window.createPinelabsEntryHtml = () => '';
    window.addPinelabsEntryWithRemoveButton = () => window.showToast("Pine Labs form element not found.", "error");
    window.createEmptyPinelabsEntry = () => {};
    window.checkAndAdjustRemoveButtons = () => {};
    window.populatePinelabsTable = (el) => {
        if (el) {
            const colspan = el.closest('table')?.tHead?.rows[0]?.cells.length || 9;
            el.innerHTML = `<tr><td colspan="${colspan}" class="empty-state">Pine Labs form initialization failed.</td></tr>`;
        }
    };
    window.deleteSinglePinelabsDetail = () => window.showToast("Pine Labs delete unavailable.", "error");
    window.updatePineLabsDetails = () => window.showToast("Pine Labs update unavailable.", "error");
    window.filterPineLabsTable = () => console.warn("Search functionality unavailable.");

     if (pinelabsSearchInput) {
         pinelabsSearchInput.removeEventListener('input', window.filterPineLabsTable);
     }
}

 
window.filterPineLabsTable();
