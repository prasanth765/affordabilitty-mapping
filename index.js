document.addEventListener('DOMContentLoaded', async () => {
    const mappingForm = document.getElementById('mapping-form');
    const mappingIdInput = document.getElementById('mapping-id');
    const storeNameSelect = document.getElementById('store-name');
    const brandSelect = document.getElementById('brand');
    const appleCodeSection = document.getElementById('apple-code-section');
    const appleCodeInput = document.getElementById('apple-code');
    const financierSelect = document.getElementById('financier');
    const financierCodeSections = {
        bajaj: document.getElementById('bajaj-code-section'),
        hdfc: document.getElementById('hdfc-code-section'),
        hdb: document.getElementById('hdb-code-section'),
        idfc: document.getElementById('idfc-code-section'),
        kotak: document.getElementById('kotak-code-section'),
        tvs: document.getElementById('tvs-code-section'),
        benow: document.getElementById('benow-code-section'),
        icici: document.getElementById('icici-code-section'),
        home_credit: document.getElementById('home-credit-code-section'),
    };
    const stateInput = document.getElementById('state');
    const asmNameInput = document.getElementById('asm-name');
    const mailIdInput = document.getElementById('mail-id');
    const requestedByInput = document.getElementById('requested-by');

    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    const formSection = document.getElementById('form-section');

    const mappingTableBody = document.getElementById('mapping-table-body');
    const pinelabsTableBody = document.getElementById('pinelabs-table-body');

    const financierTab = document.getElementById('financier-tab');
    const pinelabsTab = document.getElementById('pinelabs-tab');
    const financiersSection = document.getElementById('financiers-section');
    const pinelabsSection = document.getElementById('pinelabs-section');
    const activeTabInput = document.getElementById('active-tab');
    const addPinelabsBtn = document.getElementById('add-pinelabs');
    const pinelabsEntriesContainer = document.getElementById('pinelabs-entries');


    window.isEditMode = false;
    window.currentEditData = null;

    const showLoading = () => {
        submitBtn.disabled = true;
        submitText.classList.add('hidden');
        submitLoading.classList.remove('hidden');
    };

    const hideLoading = () => {
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
    };

    const handleOperationError = (operation, error) => {
        const userFriendlyMessage = (error.code === '42501' || (error.message && error.message.includes('policy')))
            ? 'Permission denied. You may not have the necessary rights for this operation.'
            : `${operation} failed: ${error.message}`;
        window.showToast(userFriendlyMessage, 'error');
        console.error(`Error during ${operation}:`, error);
        return false;
    };

    const loadStoreNames = async () => {
        try {
            const { data, error } = await window.supabaseClient.from('user_stores').select('store_name'); 
            if (error) throw error;
            storeNameSelect.innerHTML = '<option value="">Select Store Name</option>';
            data.forEach(store => {
                const option = document.createElement('option');
                option.value = store.store_name;
                option.textContent = store.store_name;
                storeNameSelect.appendChild(option);
            });
        } catch (error) {
            handleOperationError('Loading Store Names', error);
        }
    };

    const updateBrandAndFinancierDisplay = () => {
        appleCodeSection.classList.add('hidden');
        appleCodeInput.removeAttribute('required');
        appleCodeInput.value = '';

        if (brandSelect.value === 'Apple') {
            appleCodeSection.classList.remove('hidden');
            appleCodeInput.setAttribute('required', 'true');
        }

        Object.values(financierCodeSections).forEach(sec => sec.classList.add('hidden'));
        document.querySelectorAll('[id$="-code"]').forEach(input => {
            input.removeAttribute('required');
            input.value = '';
        });

        const selectedFinancier = financierSelect.value.toLowerCase().replace(/ /g, '_');
        const codeSection = financierCodeSections[selectedFinancier];
        if (codeSection) {
            codeSection.classList.remove('hidden');
            const codeInput = codeSection.querySelector('input[id$="-code"]');
            if (codeInput) codeInput.setAttribute('required', 'true');
        }
    };

    brandSelect.addEventListener('change', updateBrandAndFinancierDisplay);
    financierSelect.addEventListener('change', updateBrandAndFinancierDisplay);

    window.switchFormTab = (tab) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        activeTabInput.value = tab;

        if (tab === 'financier') {
            financierTab.classList.add('active');
            financiersSection.classList.remove('hidden');
            pinelabsSection.classList.add('hidden');

            financierSelect.setAttribute('required', 'true');
            pinelabsEntriesContainer.querySelectorAll('input').forEach(input => input.removeAttribute('required'));

        } else if (tab === 'pinelabs') {
            pinelabsTab.classList.add('active');
            pinelabsSection.classList.remove('hidden');
            financiersSection.classList.add('hidden');

            financierSelect.removeAttribute('required');
            if (pinelabsEntriesContainer) {
                 const firstPosId = pinelabsEntriesContainer.querySelector('.pinelabs-pos-id');
                 if (firstPosId && !firstPosId.value) firstPosId.setAttribute('required', 'true');
            }
        }
    };

    financierTab.addEventListener('click', () => window.switchFormTab('financier'));
    pinelabsTab.addEventListener('click', () => window.switchFormTab('pinelabs'));

    if (addPinelabsBtn) {
        addPinelabsBtn.addEventListener('click', () => {
            if (pinelabsEntriesContainer.children.length < 3) {
                window.addPinelabsEntryWithRemoveButton();
            } else {
                window.showToast('Maximum 3 Pine Labs entries allowed.', 'info');
            }
        });
    }

    if (pinelabsEntriesContainer) {
        pinelabsEntriesContainer.addEventListener('click', (event) => {
            if (event.target.closest('.remove-pinelabs-entry')) {
                const entryToRemove = event.target.closest('.pinelabs-entry');
                if (pinelabsEntriesContainer.children.length > 1) {
                    entryToRemove.remove();
                    window.checkAndAdjustRemoveButtons();
                    const firstPosId = pinelabsEntriesContainer.querySelector('.pinelabs-pos-id');
                    if (pinelabsEntriesContainer.children.length === 1 && firstPosId) {
                        firstPosId.setAttribute('required', 'true');
                    }
                } else {
                    // No need for a toast here. Button should be hidden when only one entry is present.
                }
            }
        });
        pinelabsEntriesContainer.addEventListener('input', (event) => {
            if (event.target.classList.contains('pinelabs-pos-id')) {
                const allPosInputs = pinelabsEntriesContainer.querySelectorAll('.pinelabs-pos-id');
                allPosInputs.forEach((input, index) => {
                    if (input.value.trim() !== '') {
                        input.removeAttribute('required');
                    } else if (index === 0 && activeTabInput.value === 'pinelabs' && allPosInputs.length === 1) {
                        input.setAttribute('required', 'true');
                    } else {
                         input.removeAttribute('required');
                    }
                });
            }
        });
    }

    const resetForm = () => {
        mappingForm.reset();
        mappingIdInput.value = '';
        window.isEditMode = false;
        window.currentEditData = null;
        cancelEditBtn.classList.add('hidden');
        submitText.textContent = 'Submit Mapping Request';

        updateBrandAndFinancierDisplay();
        window.createEmptyPinelabsEntry();
        window.switchFormTab('financier');

        appleCodeInput.value = '';
    };

    window.createEmptyPinelabsEntry();
    window.switchFormTab('financier');

    mappingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();

        if (!mappingForm.checkValidity()) {
            hideLoading();
            window.showToast('Please fill in all required fields.', 'error');
            mappingForm.reportValidity();
            return;
        }

        const activeTab = activeTabInput.value;
        const currentMappingId = mappingIdInput.value;

        const { data: { user } = { user: null }, error: userError } = await window.supabaseClient.auth.getUser(); // Use window.supabaseClient
        if (userError || !user) {
            window.showToast('Authentication required.', 'error');
            hideLoading();
            return;
        }

        const commonPayload = {
            store_name: storeNameSelect.value,
            brand: brandSelect.value,
            state: stateInput.value,
            asm: asmNameInput.value,
            mail_id: mailIdInput.value,
            requested_by: requestedByInput.value,
            requested_date: new Date().toISOString(),
            user_id: user.id
        };

        if (brandSelect.value === 'Apple') {
            commonPayload.brand_code = appleCodeInput.value;
        } else {
            commonPayload.brand_code = null;
        }

        let isFinancierMapping = false;
        let isPineLabsMapping = false;
        let pineLabsDetails = [];

        if (activeTab === 'financier') {
            isFinancierMapping = true;
            commonPayload.financier = financierSelect.value;
            const financierCodes = {};
            const selectedFinancierKey = financierSelect.value.toLowerCase().replace(/ /g, '_');
            const codeInput = financierCodeSections[selectedFinancierKey]?.querySelector('input[id$="-code"]');
            if (codeInput) {
                financierCodes[selectedFinancierKey] = codeInput.value;
            }
            commonPayload.financier_code = Object.keys(financierCodes).length > 0 ? financierCodes : {};

        } else if (activeTab === 'pinelabs') {
            isPineLabsMapping = true;
            commonPayload.financier = '';
            commonPayload.financier_code = {};

            const pinelabsEntryElements = pinelabsEntriesContainer.querySelectorAll('.pinelabs-entry');
            if (pinelabsEntryElements.length === 0) {
                 window.showToast('At least one Pine Labs entry is required when Pine Labs tab is active.', 'error');
                 hideLoading();
                 return;
            }
            
            pinelabsEntryElements.forEach(entry => {
                const posId = entry.querySelector('.pinelabs-pos-id').value.trim();
                if (posId) {
                    const plId = entry.dataset.id ? parseInt(entry.dataset.id) : null;
                    pineLabsDetails.push({
                        id: plId,
                        pos_id: posId,
                        tid: entry.querySelector('.pinelabs-tid').value.trim(),
                        serial_no: entry.querySelector('.pinelabs-serial-no').value.trim(),
                        store_id: entry.querySelector('.pinelabs-store-id').value.trim(),
                    });
                }
            });

            if (isPineLabsMapping && pineLabsDetails.length === 0) {
                window.showToast('At least one Pine Labs entry with POS ID must be filled.', 'error');
                hideLoading();
                return;
            }
        }

        try {
            let mappingRecord;

            if (window.isEditMode && currentMappingId) {
                submitText.textContent = 'Updating Mapping...';

                const userRole = await window.checkUserRole();
                if (userRole !== 'admin') {
                    const { data: existingMapping, error: fetchErr } = await window.supabaseClient.from('finance_mappings').select('user_id').eq('id', currentMappingId).single(); // Use window.supabaseClient
                    if (fetchErr || !existingMapping) throw fetchErr || new Error("Mapping not found or permission denied.");
                    if (existingMapping.user_id !== user.id) throw new Error('Permission denied: You can only edit your own mappings.');
                }

                const { data, error } = await window.supabaseClient
                    .from('finance_mappings')
                    .update(commonPayload)
                    .eq('id', currentMappingId)
                    .select()
                    .single();

                if (error) throw error;
                mappingRecord = data;
                window.showToast('Mapping updated successfully!', 'success');

            } else {
                submitText.textContent = 'Submitting...';

                const { data, error } = await window.supabaseClient
                    .from('finance_mappings')
                    .insert(commonPayload)
                    .select()
                    .single();

                if (error) throw error;
                mappingRecord = data;
                window.showToast('Mapping request submitted successfully!', 'success');
            }

            if (mappingRecord) {
                await window.updatePineLabsDetails(mappingRecord.id, isPineLabsMapping ? pineLabsDetails : []);
            }
            
            resetForm();
            await window.loadMappings();
            await window.refreshOverallTables();

        } catch (error) {
            handleOperationError(window.isEditMode ? 'Updating Mapping' : 'Submitting Mapping', error);
        } finally {
            hideLoading();
        }
    });

    window.editMapping = async (id) => {
        window.currentEditData = null;
        try {
            const { data: { user } = { user: null } } = await window.supabaseClient.auth.getUser(); // Use window.supabaseClient
            if (!user) throw new Error('Authentication required for editing.');

            const userRole = await window.checkUserRole();
            let query = window.supabaseClient.from('finance_mappings').select(`*, pinelabs_details!pinelabs_details_mapping_id_fkey(*)`).eq('id', id); // Use window.supabaseClient
            
            if (userRole !== 'admin') {
                query = query.eq('user_id', user.id);
            }
            query = query.single();

            const { data: mapping, error } = await query;
            if (error) throw error;
            if (!mapping) throw new Error('Mapping not found or you do not have permission.');

            window.currentEditData = mapping;
            window.isEditMode = true;
            cancelEditBtn.classList.remove('hidden');
            submitText.textContent = 'Update Mapping';
            formSection.style.display = 'block';
            window.scrollTo({ top: formSection.offsetTop, behavior: 'smooth' });

            mappingIdInput.value = mapping.id;
            storeNameSelect.value = mapping.store_name;
            brandSelect.value = mapping.brand;
            stateInput.value = mapping.state;
            asmNameInput.value = mapping.asm;
            mailIdInput.value = mapping.mail_id;
            requestedByInput.value = mapping.requested_by;

            if (mapping.brand === 'Apple' && mapping.brand_code) {
                appleCodeSection.classList.remove('hidden');
                appleCodeInput.value = mapping.brand_code;
                appleCodeInput.setAttribute('required', 'true');
            } else {
                appleCodeSection.classList.add('hidden');
                appleCodeInput.value = '';
                appleCodeInput.removeAttribute('required');
            }

            if (mapping.financier && mapping.financier !== '') {
                window.switchFormTab('financier');
                financierSelect.value = mapping.financier;

                if (mapping.financier_code && typeof mapping.financier_code === 'object' && mapping.financier) {
                    const selectedFinancierKey = mapping.financier.toLowerCase().replace(/ /g, '_');
                    const codeSection = financierCodeSections[selectedFinancierKey];
                    if (codeSection) {
                        codeSection.classList.remove('hidden');
                        const codeInput = codeSection.querySelector('input[id$="-code"]');
                        if (codeInput && mapping.financier_code[selectedFinancierKey]) {
                            codeInput.value = mapping.financier_code[selectedFinancierKey];
                            codeInput.setAttribute('required', 'true');
                        }
                    }
                }
                window.createEmptyPinelabsEntry();
            } else if (mapping.pinelabs_details && mapping.pinelabs_details.length > 0) {
                window.switchFormTab('pinelabs');
                pinelabsEntriesContainer.innerHTML = '';
                mapping.pinelabs_details.sort((a, b) => a.id - b.id);

                mapping.pinelabs_details.forEach(pl => {
                    pinelabsEntriesContainer.insertAdjacentHTML('beforeend', window.createPinelabsEntryHtml(
                        pl.pos_id || '', pl.tid || '', pl.serial_no || '', pl.store_id || '', true, pl.id
                    ));
                });
                window.checkAndAdjustRemoveButtons();
            } else {
                window.switchFormTab('financier');
                financierSelect.value = '';
                window.createEmptyPinelabsEntry();
            }

            updateBrandAndFinancierDisplay();
            mappingForm.reportValidity();

        } catch (error) {
            handleOperationError('Loading mapping for edit', error);
            resetForm();
            formSection.style.display = 'none';
        }
    };

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            resetForm();
            formSection.style.display = 'none';
        });
    }


    let currentMappingsData = []; // Data for "Your Mapping Requests"
    let currentPinelabsData = []; // Data for "Your Pine Labs Details"

    window.loadMappings = async () => {
        mappingTableBody.innerHTML = '<tr><td colspan="11" class="loading text-center">Loading your mappings...</td></tr>';
        pinelabsTableBody.innerHTML = '<tr><td colspan="9" class="loading text-center">Loading your Pine Labs details...</td></tr>';
        formSection.style.display = 'none';

        try {
            const { data: { user } = { user: null }, error: userError } = await window.supabaseClient.auth.getUser(); // Use window.supabaseClient
            if (userError || !user) {
                mappingTableBody.innerHTML = `<tr><td colspan="11" class="empty-state">Please log in to view your mappings.</td></tr>`;
                pinelabsTableBody.innerHTML = `<tr><td colspan="9" class="empty-state">Please log in to view your Pine Labs details.</td></tr>`;
                return;
            }

            const { data: mappings, error: mappingsError } = await window.supabaseClient
                .from('finance_mappings')
                .select(`id, store_name, asm, mail_id, brand, brand_code, financier, financier_code, state, requested_by, requested_date, pinelabs_details!pinelabs_details_mapping_id_fkey(*), user_id`)
                .eq('user_id', user.id)
                .order('id', { ascending: false });

            if (mappingsError) throw mappingsError;
            currentMappingsData = mappings || []; // Store fetched raw data for local filtering

            currentPinelabsData = [];
            currentMappingsData.forEach(mapping => {
                if (mapping.pinelabs_details && mapping.pinelabs_details.length > 0) {
                    mapping.pinelabs_details.forEach(pl => {
                        currentPinelabsData.push({ ...pl, finance_mappings: { id: mapping.id, store_name: mapping.store_name, brand: mapping.brand } });
                    });
                }
            });

            applyYourMappingsFilters(); // Apply filters and populate the "Your Mappings" table
            // Populate the "Your Pine Labs" table directly with fetched data. Filters will be applied by event listener.
            window.populatePinelabsTable(pinelabsTableBody, currentPinelabsData, { editable: true });

        } catch (error) {
            handleOperationError('Loading user mappings/pine labs', error);
            mappingTableBody.innerHTML = `<tr><td colspan="11" class="empty-state">Error loading your data.</td></tr>`;
            pinelabsTableBody.innerHTML = `<tr><td colspan="9" class="empty-state">Error loading your Pine Labs.</td></tr>`;
        }
    };


    const populateMappingTable = (mappingsToDisplay) => {
        mappingTableBody.innerHTML = '';
        const colSpan = mappingTableBody.parentElement?.tHead?.rows[0]?.cells.length || 11;
        
        if (mappingsToDisplay && mappingsToDisplay.length > 0) {
            mappingsToDisplay.forEach(row => {
                const tr = mappingTableBody.insertRow();
                let financierDisplay = row.financier || '-'; 
                let financierCodeDisplay = '-';

                if (row.financier && row.financier !== '') { 
                    if (row.financier_code && typeof row.financier_code === 'object') {
                        const financierKey = row.financier.toLowerCase().replace(/ /g, '_');
                        financierCodeDisplay = row.financier_code[financierKey] || '-';
                    } else if (typeof row.financier_code === 'string') {
                        financierCodeDisplay = row.financier_code || '-';
                    }
                }
                
                tr.innerHTML = `<td class="table-id-column">${row.id}</td><td>${row.store_name || '-'}</td><td>${row.asm || '-'}</td><td>${row.mail_id || '-'}</td><td data-brand="${row.brand||''}">${row.brand || '-'}</td><td>${row.brand === 'Apple' ? (row.brand_code || '-') : '-'}</td><td>${financierDisplay}</td><td>${financierCodeDisplay}</td><td class="table-date-column">${row.requested_date ? new Date(row.requested_date).toLocaleDateString() : '-'}</td><td>${row.requested_by || '-'}</td><td class="table-actions-column">
                    <div class="action-buttons">
                        <button class="btn btn-icon-only btn-edit-icon" onclick="window.editMapping(${row.id})" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button class="btn btn-icon-only btn-delete-icon" onclick="window.deleteMapping(${row.id})" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                </td>`;
            });
        } else {
            const noDataFilterRow = document.getElementById('mapping-table-body-no-data-filter');
            if (noDataFilterRow) noDataFilterRow.remove(); 
            mappingTableBody.innerHTML = `<tr><td colspan="${colSpan}" class="empty-state">No matching mapping requests found.</td></tr>`;
        }
    };

    window.deleteMapping = async (id) => {
        if (!confirm('Are you sure you want to delete this mapping? All associated Pine Labs details will also be deleted.')) {
            return;
        }

        try {
            showLoading();

            const { data: { user } = { user: null } } = await window.supabaseClient.auth.getUser(); 
            if (!user) throw new Error('Authentication required.');

            const userRole = await window.checkUserRole();
            if (userRole !== 'admin') {
                const { data: existingMapping, error: fetchErr } = await window.supabaseClient.from('finance_mappings').select('user_id').eq('id', id).single(); 
                if (fetchErr || !existingMapping) throw fetchErr || new Error("Mapping not found or permission denied.");
                if (existingMapping.user_id !== user.id) throw new Error('Permission denied: You can only delete your own mappings.');
            }

            const { error: pinelabsDeleteError } = await window.supabaseClient
                .from('pinelabs_details')
                .delete()
                .eq('mapping_id', id);

            if (pinelabsDeleteError) {
                console.warn('Could not delete associated Pine Labs details (possibly due to RLS/permissions, or they didn\'t exist):', pinelabsDeleteError.message);
            }

            const { error: mappingDeleteError } = await window.supabaseClient
                .from('finance_mappings')
                .delete()
                .eq('id', id);

            if (mappingDeleteError) throw mappingDeleteError;

            window.showToast('Mapping and associated details deleted successfully!', 'success');
            resetForm();
            formSection.style.display = 'none';
            await window.loadMappings();
            await window.refreshOverallTables();

        } catch (error) {
            handleOperationError('Deleting Mapping', error);
        } finally {
            hideLoading();
        }
    };

    const yourMappingsSearchInput = document.getElementById('yourMappingsSearch');
    const yourMappingsBrandFilter = document.getElementById('yourMappingsBrandFilter');

    const applyYourMappingsFilters = () => {
        const searchTerm = yourMappingsSearchInput.value.toLowerCase();
        const brandFilter = yourMappingsBrandFilter.value;

        const filteredData = currentMappingsData.filter(row => {
            const isPurePineLabsMapping = (row.financier === '' || row.financier === null) && row.pinelabs_details && row.pinelabs_details.length > 0;
            if (isPurePineLabsMapping) {
                return false; 
            }
            
            let financierSearchValue = row.financier || ''; 

            const matchesSearch = searchTerm === '' ||
                                (row.store_name?.toLowerCase().includes(searchTerm)) ||
                                (row.asm?.toLowerCase().includes(searchTerm)) ||
                                (row.mail_id?.toLowerCase().includes(searchTerm)) ||
                                (row.brand?.toLowerCase().includes(searchTerm)) ||
                                (financierSearchValue?.toLowerCase().includes(searchTerm)) || 
                                (row.requested_by?.toLowerCase().includes(searchTerm)) ||
                                (row.id?.toString().includes(searchTerm));

            const matchesBrand = brandFilter === '' || row.brand === brandFilter;
            return matchesSearch && matchesBrand;
        });

        populateMappingTable(filteredData);
    };

    if (yourMappingsSearchInput) yourMappingsSearchInput.addEventListener('input', applyYourMappingsFilters);
    if (yourMappingsBrandFilter) yourMappingsBrandFilter.addEventListener('change', applyYourMappingsFilters);


    const yourPinelabsSearchInput = document.getElementById('yourPinelabsSearch');
    const yourPinelabsBrandFilter = document.getElementById('yourPinelabsBrandFilter');

    const applyYourPinelabsFilters = () => {
        const searchTerm = yourPinelabsSearchInput.value.toLowerCase();
        const brandFilter = yourPinelabsBrandFilter.value;
        const filteredData = currentPinelabsData.filter(pl => {
            const matchesSearch = searchTerm === '' ||
                                (pl.pos_id?.toLowerCase().includes(searchTerm)) ||
                                (pl.tid?.toLowerCase().includes(searchTerm)) ||
                                (pl.serial_no?.toLowerCase().includes(searchTerm)) ||
                                (pl.store_id?.toLowerCase().includes(searchTerm)) ||
                                (pl.mapping_id?.toString().includes(searchTerm)) ||
                                (pl.id?.toString().includes(searchTerm)) ||
                                (pl.finance_mappings?.store_name?.toLowerCase().includes(searchTerm));

            const matchesBrand = brandFilter === '' || pl.finance_mappings?.brand === brandFilter;
            return matchesSearch && matchesBrand;
        });
        window.populatePinelabsTable(pinelabsTableBody, filteredData, { editable: true });

        const actualDisplayedRows = pinelabsTableBody.querySelectorAll('tr:not([id^="pinelabs-table-body-"])').length;
        const colSpan = pinelabsTableBody.parentElement?.tHead?.rows[0]?.cells.length || 9;
        const existingNoDataFilter = document.getElementById('pinelabs-table-body-no-data-filter');

        if (actualDisplayedRows === 0) {
            if (!existingNoDataFilter) {
                const tr = document.createElement('tr');
                tr.id = 'pinelabs-table-body-no-data-filter';
                tr.innerHTML = `<td colspan="${colSpan}" class="empty-state">No matching Pine Labs details found.</td>`;
                pinelabsTableBody.appendChild(tr);
            } else {
                existingNoDataFilter.style.display = ''; 
            }
        } else {
            if (existingNoDataFilter) existingNoDataFilter.remove();
        }
    };

    if (yourPinelabsSearchInput) yourPinelabsSearchInput.addEventListener('input', applyYourPinelabsFilters);
    if (yourPinelabsBrandFilter) yourPinelabsBrandFilter.addEventListener('change', applyYourPinelabsFilters);


    // overallMainMappingsSearchInput and overallMainMappingsBrandFilter event listeners are in navigation.js now.
    // Same for overallPinelabsSearchInput and overallPinelabsBrandFilter event listeners.


    const downloadExcelBtn = document.getElementById('download-excel');
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', async () => {
            try {
                if (typeof XLSX === 'undefined') throw new Error('Excel library not loaded.');
                const { data: { user } = { user: null } } = await window.supabaseClient.auth.getUser(); // Use window.supabaseClient
                if (!user) {
                    window.showToast('Please log in to download data.', 'info');
                    return;
                }
                const { data: mappings, error } = await window.supabaseClient 
                    .from('finance_mappings')
                    .select('*, pinelabs_details!pinelabs_details_mapping_id_fkey(*)')
                    .eq('user_id', user.id)
                    .order('id', { ascending: false });

                if (error) throw error;

                const exportData = mappings.map(m => {
                    let financierCode = '-';
                    let financierExcelDisplay = m.financier || '-';

                    if (m.financier && m.financier !== '') {
                        if (m.financier_code && typeof m.financier_code === 'object') {
                            const financierKey = m.financier.toLowerCase().replace(/ /g, '_');
                            financierCode = m.financier_code[financierKey] || '-';
                        }
                    } else { 
                         financierExcelDisplay = '-'; 
                    }

                    const pinelabsString = m.pinelabs_details?.map(p => `POS:${p.pos_id||'N/A'}, TID:${p.tid||'N/A'}, SerialNo:${p.serial_no||'N/A'}, StoreID(PL):${p.store_id||'N/A'}`).join('; ') || '-';

                    return {
                        ID: m.id,
                        'Store Name': m.store_name || '-',
                        'State': m.state || '-',
                        'ASM': m.asm || '-',
                        'Mail ID': m.mail_id || '-',
                        'Brand': m.brand || '-',
                        'Brand Code (Apple)': m.brand === 'Apple' ? (m.brand_code || '-') : '-',
                        'Financier': financierExcelDisplay,
                        'Financier Code': financierCode,
                        'Pine Labs Details': pinelabsString,
                        'Requested By': m.requested_by || '-',
                        'Requested Date': m.requested_date ? new Date(m.requested_date).toLocaleDateString() : '-'
                    };
                });

                if (exportData.length === 0) {
                    window.showToast('No data to export for your mappings.', 'info');
                    return;
                }

                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Your Mappings");
                XLSX.writeFile(wb, `Your_Mappings_${new Date().toISOString().split('T')[0]}.xlsx`);

            } catch (err) {
                window.showToast('Excel export failed: ' + err.message, 'error');
                console.error('Excel Export Error:', err);
            }
        });
    }

    window.initializeApp = async () => {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                const { error } = await window.supabaseClient.auth.signOut(); // Use window.supabaseClient
                if (error) {
                    window.showToast('Logout failed: ' + error.message, 'error');
                } else {
                    window.location.href = 'login.html';
                }
            });
        }
        await loadStoreNames();
        updateBrandAndFinancierDisplay();

        await window.switchMainTab('paper');
        formSection.style.display = 'block';
    };
});