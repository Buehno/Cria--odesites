/* ==========================================================================
   KRIA WEB - APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let currentStep = 1;
    const totalSteps = 7;
    
    // Website Setup Prices (Calculated dynamically)
    const basePrices = {
        salao: 699,
        restaurante: 899,
        empresa: 999,
        barbearia: 799,
        exclusivo: 1499
    };

    const baseDeadlines = {
        salao: 5,
        restaurante: 7,
        empresa: 7,
        barbearia: 6,
        exclusivo: 10
    };

    // Support & Maintenance Monthly Prices
    const supportPrices = {
        none: 0,
        bronze: 99,
        prata: 249,
        ouro: 499
    };

    const supportNames = {
        none: 'Sem Plano de Suporte',
        bronze: 'Plano de Suporte Bronze 🥉',
        prata: 'Plano de Suporte Prata Pro 🥈',
        ouro: 'Plano de Suporte Ouro VIP 🥇'
    };

    // --- DOM ELEMENTS ---
    // Lighting Switcher (Theme Toggle)
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    
    // Navbar
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileOverlay = document.getElementById('mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-btn');
    
    // Wizard Steps & Indicators
    const wizardForm = document.getElementById('wizard-form');
    const steps = document.querySelectorAll('.wizard-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const progressBar = document.getElementById('wizard-progress-bar');
    
    // Wizard Navigation Buttons
    const btnPrev = document.getElementById('btn-wizard-prev');
    const btnNext = document.getElementById('btn-wizard-next');
    const btnFinish = document.getElementById('btn-finish-wizard');
    const navButtonsContainer = document.getElementById('wizard-navigation-buttons');
    
    // Step 1 Options
    const templateRadios = document.querySelectorAll('input[name="base_template"]');
    const exclusiveDetails = document.getElementById('exclusive-details-container');
    const exclusiveTextarea = document.getElementById('exclusive_description');
    
    // Step 2 Upload Previews
    const logoInput = document.getElementById('logo_upload');
    const logoDropzone = document.getElementById('logo-dropzone');
    const logoPreview = document.getElementById('logo-preview');
    
    const bannerInput = document.getElementById('banner_upload');
    const bannerDropzone = document.getElementById('banner-dropzone');
    const bannerPreview = document.getElementById('banner-preview');

    // Step 3 Colors
    const themeRadios = document.querySelectorAll('input[name="color_theme"]');
    const customColorsBox = document.getElementById('custom-colors-container');
    const pickerPrimary = document.getElementById('color_primary');
    const textPrimary = document.getElementById('color_primary_text');
    const pickerSecondary = document.getElementById('color_secondary');
    const textSecondary = document.getElementById('color_secondary_text');

    // Step 4 Video
    const videoInput = document.getElementById('video_file');
    const videoUploadStatus = document.getElementById('video-upload-status');

    // Step 5 Contact Inputs
    const inputEmail = document.getElementById('contact_email');
    const inputPhone = document.getElementById('contact_phone');
    const inputAddress = document.getElementById('contact_address');
    const inputSocials = document.getElementById('contact_socials');
    
    // Step 6 Calculations & Toggles
    const supportSelect = document.getElementById('support_plan');
    const assistanceToggle = document.getElementById('kria-assistance-toggle');
    const assistanceBadge = document.getElementById('assistance-badge');
    const summaryPrice = document.getElementById('wizard-summary-price');
    const summaryRecurring = document.getElementById('wizard-summary-recurring');
    const summaryDeadline = document.getElementById('wizard-summary-deadline');
    
    // Step 6 Review Table
    const revTemplate = document.getElementById('review-template-name');
    const revAssets = document.getElementById('review-assets-status');
    const revColor = document.getElementById('review-color-scheme');
    const revMedia = document.getElementById('review-media-status');
    const revContact = document.getElementById('review-contact-details');

    // Step 7 Checkout details
    const orderTemplateLabel = document.getElementById('order-template-label');
    const orderTemplatePrice = document.getElementById('order-template-price');
    const orderAssistanceLine = document.getElementById('order-assistance-line');
    const orderSupportLine = document.getElementById('order-support-line');
    const orderSupportLabel = document.getElementById('order-support-label');
    const orderSupportPrice = document.getElementById('order-support-price');
    const orderTotalPrice = document.getElementById('order-total-price');
    const orderTotalDeadline = document.getElementById('order-total-deadline');
    
    // Step 7 Credit Card Simulator
    const cardNumInput = document.getElementById('card_num');
    const cardNameInput = document.getElementById('card_name');
    const cardExpiryInput = document.getElementById('card_expiry');
    const cardCvvInput = document.getElementById('card_cvv');
    
    const cardNumDisp = document.getElementById('card-num-disp');
    const cardNameDisp = document.getElementById('card-name-disp');
    const cardExpDisp = document.getElementById('card-exp-disp');

    // Payment Tabs switcher
    const payTabs = document.querySelectorAll('.pay-tab');
    const payContents = document.querySelectorAll('.payment-tab-content');
    const btnCopyPix = document.getElementById('btn-copy-pix');
    const pixCodeInput = document.getElementById('pix-code');
    const btnBoleto = document.getElementById('btn-generate-boleto');

    // Success Screen
    const successScreen = document.getElementById('wizard-success-screen');
    const orderNumberDisplay = document.getElementById('order-number-display');
    const successDeadlineValue = document.getElementById('success-deadline-value');
    const successEmailValue = document.getElementById('success-email-value');
    const btnSuccessReset = document.getElementById('btn-success-reset');


    // ==========================================
    // ☀️ LIGHT/DARK THEME SWITCHER LOGIC
    // ==========================================
    const setTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline-block';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            sunIcon.style.display = 'inline-block';
            moonIcon.style.display = 'none';
            localStorage.setItem('theme', 'light');
        }
    };

    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        setTheme(isDark ? 'light' : 'dark');
    });

    // Check system preference or saved settings on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Default to light mode (orange/yellow/white) as requested
        setTheme('light');
    }


    // ==========================================
    // MOBILE NAV CONTROLLER
    // ==========================================
    const toggleMobileMenu = () => {
        const isActive = mobileOverlay.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : 'auto';
    };

    mobileToggle.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileOverlay.classList.remove('active');
            mobileToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });


    // ==========================================
    // INTEGRATED SELECTOR LINK FROM PLANS
    // ==========================================
    // Pricing support cards clicking scrolls to wizard and sets dropdown support plan
    document.querySelectorAll('.plans-grid .btn, .plans-grid a').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const parentCard = e.currentTarget.closest('.plan-card');
            const tierText = parentCard.querySelector('.plan-tier').innerText.toLowerCase();
            
            let supportSelectVal = 'none';
            if (tierText.includes('bronze')) supportSelectVal = 'bronze';
            else if (tierText.includes('prata')) supportSelectVal = 'prata';
            else if (tierText.includes('ouro')) supportSelectVal = 'ouro';
            
            supportSelect.value = supportSelectVal;
            updateCalculations();
            
            // Navigate to Wizard Step 1
            goToStep(1);

            // Scroll to wizard section
            const anchor = document.getElementById('wizard-anchor');
            if (anchor) {
                anchor.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });


    // ==========================================
    // STEP 1: EXCLUSIVE DETAILS TOGGLE
    // ==========================================
    templateRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'exclusivo') {
                exclusiveDetails.style.display = 'block';
                exclusiveTextarea.setAttribute('required', 'required');
            } else {
                exclusiveDetails.style.display = 'none';
                exclusiveTextarea.removeAttribute('required');
            }
            updateCalculations();
        });
    });


    // ==========================================
    // STEP 2: UPLOAD DROPZONES AND FILE HANDLERS
    // ==========================================
    const setupDropzone = (inputElement, dropzoneElement, previewElement) => {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzoneElement.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzoneElement.style.borderColor = 'var(--accent-gold)';
                dropzoneElement.style.backgroundColor = 'var(--bg-tertiary)';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzoneElement.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzoneElement.style.borderColor = 'var(--border-color)';
                dropzoneElement.style.backgroundColor = 'var(--bg-input)';
            }, false);
        });

        dropzoneElement.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length) {
                inputElement.files = files;
                handleFilePreview(files[0], previewElement, dropzoneElement);
            }
        });

        dropzoneElement.addEventListener('click', () => {
            inputElement.click();
        });

        inputElement.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length) {
                handleFilePreview(files[0], previewElement, dropzoneElement);
            }
        });
    };

    const handleFilePreview = (file, previewImg, dropzoneDiv) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                const prompt = dropzoneDiv.querySelector('.dropzone-prompt');
                if (prompt) prompt.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    };

    setupDropzone(logoInput, logoDropzone, logoPreview);
    setupDropzone(bannerInput, bannerDropzone, bannerPreview);


    // ==========================================
    // STEP 3: COLOR PALETTE TOGGLING
    // ==========================================
    themeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom_colors') {
                customColorsBox.style.display = 'block';
            } else {
                customColorsBox.style.display = 'none';
            }
        });
    });

    const syncColorPicker = (picker, textInput) => {
        picker.addEventListener('input', (e) => {
            textInput.value = e.target.value;
        });
        textInput.addEventListener('change', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                picker.value = val;
                textInput.value = val;
            }
        });
    };

    syncColorPicker(pickerPrimary, textPrimary);
    syncColorPicker(pickerSecondary, textSecondary);


    // ==========================================
    // STEP 4: VIDEO UPLOAD FIELD
    // ==========================================
    if (videoInput) {
        videoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const sizeMb = file.size / (1024 * 1024);
                if (sizeMb > 50) {
                    alert('Esse vídeo é um pouco pesado! Escolha um arquivo de no máximo 50MB ou use links do YouTube/Vimeo. 😊');
                    videoInput.value = '';
                    videoUploadStatus.innerText = 'Arraste seu vídeo de apresentação ou clique para selecionar';
                } else {
                    videoUploadStatus.innerText = `Vídeo pronto: ${file.name} (${sizeMb.toFixed(1)} MB) ✅`;
                    videoUploadStatus.style.color = 'var(--accent-gold)';
                }
            }
        });
    }


    // ==========================================
    // WIZARD ENGINE & VALIDATION
    // ==========================================
    const updateWizardProgress = () => {
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        stepIndicators.forEach(ind => {
            const stepNum = parseInt(ind.getAttribute('data-step'));
            ind.classList.remove('active', 'completed');
            if (stepNum === currentStep) {
                ind.classList.add('active');
            } else if (stepNum < currentStep) {
                ind.classList.add('completed');
            }
        });
    };

    const validateStep = (step) => {
        if (step === 1) {
            const selectedTemplate = document.querySelector('input[name="base_template"]:checked').value;
            if (selectedTemplate === 'exclusivo' && !exclusiveTextarea.value.trim()) {
                alert('Escreva o que você precisa no seu site exclusivo para podermos continuar! ✨');
                exclusiveTextarea.focus();
                return false;
            }
        }
        
        if (step === 5) {
            if (!inputEmail.checkValidity()) {
                alert('Ops! Digite um e-mail comercial válido para podermos falar com você.');
                inputEmail.focus();
                return false;
            }
            if (!inputPhone.value.trim()) {
                alert('Precisamos do seu número de WhatsApp para acertar os detalhes do site! 📞');
                inputPhone.focus();
                return false;
            }
        }
        return true;
    };

    const goToStep = (stepNumber) => {
        if (stepNumber < 1 || stepNumber > totalSteps) return;
        
        // Hide previous step
        steps.forEach(s => s.classList.remove('active-step'));
        
        // Show current step
        const currentStepEl = document.querySelector(`.wizard-step[data-step="${stepNumber}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active-step');
        }

        currentStep = stepNumber;
        updateWizardProgress();

        // Control buttons visibility
        btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
        
        if (currentStep === totalSteps) {
            btnNext.style.display = 'none';
            btnFinish.style.display = 'block';
            navButtonsContainer.style.display = 'none'; 
        } else {
            btnNext.style.display = 'block';
            btnFinish.style.display = 'none';
            navButtonsContainer.style.display = 'flex';
        }

        // Run tabulators/summaries on specific steps
        if (currentStep === 6) {
            tabulateReviewData();
            updateCalculations();
        }
        
        if (currentStep === 7) {
            setupFinalCheckout();
        }
    };

    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            goToStep(currentStep + 1);
        }
    });

    btnPrev.addEventListener('click', () => {
        goToStep(currentStep - 1);
    });

    stepIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            const targetStep = parseInt(indicator.getAttribute('data-step'));
            if (targetStep < currentStep) {
                goToStep(targetStep);
            } else if (targetStep > currentStep) {
                for (let s = currentStep; s < targetStep; s++) {
                    if (!validateStep(s)) return;
                }
                goToStep(targetStep);
            }
        });
    });


    // ==========================================
    // CALCULATOR: DYNAMIC PRICES & DEADLINES
    // ==========================================
    const updateCalculations = () => {
        const selectedTemplate = document.querySelector('input[name="base_template"]:checked').value;
        let setupPrice = basePrices[selectedTemplate];
        let deadline = baseDeadlines[selectedTemplate];

        // Read assistance checkbox
        const assistanceActive = assistanceToggle.checked;
        if (assistanceActive) {
            setupPrice += 350;
            deadline += 3;
            assistanceBadge.style.display = 'block';
        } else {
            assistanceBadge.style.display = 'none';
        }

        // Read support monthly plan
        const supportVal = supportSelect.value;
        const monthlySupportPrice = supportPrices[supportVal];

        // Render values in Step 6
        summaryPrice.innerText = `R$ ${setupPrice.toLocaleString('pt-BR')}`;
        
        if (supportVal !== 'none') {
            summaryRecurring.innerText = `+ R$ ${monthlySupportPrice} /mês`;
            summaryRecurring.style.display = 'block';
        } else {
            summaryRecurring.style.display = 'none';
        }
        
        summaryDeadline.innerText = `${deadline} dias úteis`;
    };

    assistanceToggle.addEventListener('change', updateCalculations);
    supportSelect.addEventListener('change', updateCalculations);


    // ==========================================
    // STEP 6: DATA SUMMARY COMPILER
    // ==========================================
    const tabulateReviewData = () => {
        const templateVal = document.querySelector('input[name="base_template"]:checked').value;
        const templateNames = {
            salao: 'Salão de Beleza 💇',
            restaurante: 'Restaurante 🔥',
            empresa: 'Para o seu Negócio 🏢',
            exclusivo: 'Design 100% Exclusivo ✨'
        };
        revTemplate.innerText = templateNames[templateVal];

        let logoStatus = logoInput.files.length ? 'Logo Enviada 🎉' : 'Sem Logo';
        let bannerStatus = bannerInput.files.length ? 'Banner Enviado 🖼' : 'Sem Banner';
        revAssets.innerText = `${logoStatus} | ${bannerStatus}`;

        const themeVal = document.querySelector('input[name="color_theme"]:checked').value;
        const themeNames = {
            dark_gold: 'Premium Gold',
            security_blue: 'Azul Tecnológico',
            clean_nordic: 'Branco & Cinza Clean',
            custom_colors: `Personalizado (${pickerPrimary.value} / ${pickerSecondary.value})`
        };
        revColor.innerText = themeNames[themeVal];

        const videoLinkVal = document.getElementById('video_link').value;
        const hasVideoFile = videoInput.files.length;
        if (videoLinkVal && hasVideoFile) {
            revMedia.innerText = 'Vídeo por Link + Arquivo de Vídeo';
        } else if (videoLinkVal) {
            revMedia.innerText = 'Vídeo por link';
        } else if (hasVideoFile) {
            revMedia.innerText = 'Vídeo local carregado';
        } else {
            revMedia.innerText = 'Sem mídia de vídeo';
        }

        const email = inputEmail.value || '-';
        const phone = inputPhone.value || '-';
        revContact.innerText = `Email: ${email} | Tel: ${phone}`;
    };


    // ==========================================
    // STEP 7: SECURE CHECKOUT SETUP
    // ==========================================
    const setupFinalCheckout = () => {
        const selectedTemplate = document.querySelector('input[name="base_template"]:checked').value;
        const templateNames = {
            salao: 'Modelo Salão de Beleza',
            restaurante: 'Modelo Restaurante',
            empresa: 'Modelo Para o seu Negócio',
            exclusivo: 'Layout Exclusivo Customizado'
        };
        
        let templatePrice = basePrices[selectedTemplate];
        let deadline = baseDeadlines[selectedTemplate];
        let totalSetupPrice = templatePrice;
        
        orderTemplateLabel.innerText = templateNames[selectedTemplate];
        orderTemplatePrice.innerText = `R$ ${templatePrice.toLocaleString('pt-BR')},00`;

        // Assistance toggles
        const assistanceActive = assistanceToggle.checked;
        if (assistanceActive) {
            orderAssistanceLine.style.display = 'flex';
            totalSetupPrice += 350;
            deadline += 3;
        } else {
            orderAssistanceLine.style.display = 'none';
        }

        // Support toggle calculations
        const supportVal = supportSelect.value;
        const monthlySupportPrice = supportPrices[supportVal];
        
        if (supportVal !== 'none') {
            orderSupportLine.style.display = 'flex';
            orderSupportLabel.innerText = supportNames[supportVal];
            orderSupportPrice.innerText = `R$ ${monthlySupportPrice.toLocaleString('pt-BR')},00 /mês`;
            orderTotalPrice.innerText = `R$ ${totalSetupPrice.toLocaleString('pt-BR')},00 + R$ ${monthlySupportPrice},00/mês`;
        } else {
            orderSupportLine.style.display = 'none';
            orderTotalPrice.innerText = `R$ ${totalSetupPrice.toLocaleString('pt-BR')},00`;
        }

        orderTotalDeadline.innerText = `${deadline} dias úteis`;
        
        // Update Pix Simulation code value
        pixCodeInput.value = `00020126580014BR.GOV.BCB.PIX0136kriaweb-recebimentos-pix-simulacao-20265204000053039865406${totalSetupPrice}.005802BR5908Kria Web6009Sao Paulo62070503***6304A5F2`;
    };


    // ==========================================
    // PAYMENT TABS LOGIC
    // ==========================================
    payTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            payTabs.forEach(t => t.classList.remove('active'));
            payContents.forEach(c => c.classList.remove('active-content'));

            e.currentTarget.classList.add('active');
            const targetId = e.currentTarget.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active-content');
            }
        });
    });

    btnCopyPix.addEventListener('click', () => {
        pixCodeInput.select();
        pixCodeInput.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(pixCodeInput.value)
            .then(() => {
                btnCopyPix.innerText = 'Copiado! 👍';
                btnCopyPix.style.backgroundColor = 'var(--success)';
                btnCopyPix.style.color = '#ffffff';
                setTimeout(() => {
                    btnCopyPix.innerText = 'Copiar Código';
                    btnCopyPix.style.backgroundColor = 'var(--accent-gold)';
                    btnCopyPix.style.color = '#ffffff';
                }, 2000);
            })
            .catch(() => {
                alert('Erro ao copiar código Pix. Copie o código manualmente na caixa de texto.');
            });
    });

    btnBoleto.addEventListener('click', () => {
        alert('Boleto Bancário de teste gerado! Baixando PDF demonstrativo.');
    });


    // ==========================================
    // CREDIT CARD INPUT SIMULATOR
    // ==========================================
    cardNumInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formatted = '';
        for (let i = 0; i < val.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += val[i];
        }
        e.target.value = formatted;
        cardNumDisp.innerText = formatted || '•••• •••• •••• ••••';
    });

    cardNameInput.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase();
        cardNameDisp.innerText = val || 'NOME DO TITULAR';
    });

    cardExpiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (val.length > 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        e.target.value = val;
        cardExpDisp.innerText = val || 'MM/AA';
    });


    // ==========================================
    // FINAL SUBMIT & SUCCESS STATE
    // ==========================================
    btnFinish.addEventListener('click', () => {
        const email = inputEmail.value;
        const selectedTemplate = document.querySelector('input[name="base_template"]:checked').value;
        let deadline = baseDeadlines[selectedTemplate];
        if (assistanceToggle.checked) {
            deadline += 3;
        }

        const randomNum = Math.floor(1000 + Math.random() * 9000);
        orderNumberDisplay.innerText = `#KR-2026-${randomNum}`;
        successDeadlineValue.innerText = `${deadline} dias úteis`;
        successEmailValue.innerText = email;

        successScreen.style.display = 'flex';
        
        const section = document.getElementById('criar-site');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Reset wizard
    btnSuccessReset.addEventListener('click', () => {
        wizardForm.reset();
        logoPreview.style.display = 'none';
        logoDropzone.querySelector('.dropzone-prompt').style.display = 'flex';
        bannerPreview.style.display = 'none';
        bannerDropzone.querySelector('.dropzone-prompt').style.display = 'flex';
        
        exclusiveDetails.style.display = 'none';
        customColorsBox.style.display = 'none';
        videoUploadStatus.innerText = 'Arraste seu vídeo de apresentação ou clique para selecionar';
        videoUploadStatus.style.color = 'var(--text-secondary)';
        
        cardNumDisp.innerText = '•••• •••• •••• ••••';
        cardNameDisp.innerText = 'NOME DO TITULAR';
        cardExpDisp.innerText = 'MM/AA';

        successScreen.style.display = 'none';
        goToStep(1);
    });

});
