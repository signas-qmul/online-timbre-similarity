requirejs.config({
    shim: {
        lab: {
            exports: 'lab'
        },
        HeadphoneCheck: {
            exports: 'HeadphoneCheck'
        }
    },
    paths: {
        lab: '../lib/lab',
        HeadphoneCheck: '../lib/HeadphoneCheck'
    }
});

define(['lab', 'templating', 'HeadphoneCheck'], function(lab, templating, HeadphoneCheck) {
return {
    dissimilarityScreen: (template, screenName, audioFiles) => {
        const populatedTemplate = templating.populateScreenTemplate(
            template,
            {
                'audio_src_a': audioFiles.audio_src_a,
                'audio_src_b': audioFiles.audio_src_b
            });
        
        const labScreen = new lab.html.Form({
            content: populatedTemplate,
            title: screenName
        });

        let playing = false;
        let playerTimeout;
        const playAudio = function() {
            const playCountElement =
                document.getElementById('stimulus_play_count');
            const currentPlayCount = parseInt(playCountElement.value);
            playCountElement.value = currentPlayCount + 1;

            playing = true;
            const playerA = document.getElementById('audio_a');
            const playerB = document.getElementById('audio_b');
            playerA.onended = () => { 
                playerTimeout = setTimeout(() => {
                    playerB.play()
                },
                500);
            };
            playerB.onended = () => { 
                playing = false; 
            }
            playerA.play();
        }

        let playListener;
        let submitListener;
        labScreen.on('run', () => {
            playAudio();
            playListener = document.addEventListener('keypress', event => {
                if (event.key === 'r' && !playing) {
                    playAudio();
                }
            });

            const numberBox = document.getElementById('dissimilarity_rating');
            numberBox.focus();

            const submitButton = document.getElementsByName('submit_button')[0];
            let hasDelayed = false;
            let hasPaused = false;

            submitListener = submitButton.addEventListener('click', event => {
                if (!hasDelayed) {
                    event.preventDefault();

                    if (numberBox.value === '') {
                        numberBox.style.background = '#e84a5f';
                        setTimeout(() => {
                            numberBox.style.background = '#ffffff';
                        },
                        650);
                        return;
                    }

                    numberBox.style.background = '#a8df65';

                    setTimeout(() => {
                        submitButton.click();
                    },
                    650);
                    hasDelayed = true;
                }
                if (!hasPaused) {
                    const audioPlayerA = document.getElementById('audio_a');
                    const audioPlayerB = document.getElementById('audio_b');

                    audioPlayerA.onended = undefined;
                    audioPlayerB.onended = undefined;
                    clearTimeout(playerTimeout);
                    audioPlayerA.pause(); 
                    audioPlayerB.pause(); 
                    hasPaused = true;
                }
            });
        });

        labScreen.on('end', () => {
            document.removeEventListener('keypress', playListener);
            
            const submitButton = document.getElementsByName('submit_button')[0];
            submitButton.removeEventListener('click', submitListener);
        });

        return labScreen;
    },
    textScreen: template => {
        const labScreen = new lab.html.Screen({
            content: template,
        });
        let continueListener;
        labScreen.on('run', () => {
            const continueButton = document.getElementById('continue');
            continueListener = continueButton.addEventListener(
                'click',
                event => {
                    labScreen.end();
                }
            );
        });
        labScreen.on('end', () => {
            const continueButton = document.getElementById('continue');
            continueButton.removeEventListener('click', continueListener);
        });
        return labScreen;
    },
    textScreenNoContinue: template => {
        const labScreen = new lab.html.Screen({
            content: template,
        });
        return labScreen;
    },
    headphoneCheck: template => {
        const labScreen = new lab.html.Screen({
            content: template,
        });
        labScreen.on('run', () => {
            HeadphoneCheck.runHeadphoneCheck({
                trialsPerPage: 1
            });
            $(document).on('hcHeadphoneCheckEnd', (event, data) => {
                if (data.didPass) {
                    labScreen.end();
                } else {
                    $('<div/>', {
                        class: 'hc-calibration-instruction',
                        html: 'You must be wearing headphones to participate.' +
                            ' The experiment will now terminate.<br/><b>' +
                            'Please close your browser window.</b>',
                    }).appendTo($('#hc-container'));
                }
            });
        });
        return labScreen;
    },
    questionnaire: template => {
        const labScreen = new lab.html.Form({
            content: template,
            title: 'questionnaire'
        });
        return labScreen;
    },
    consentForm: (template, failure_template) => {
        const labScreen = new lab.html.Form({
            content: template,
            title: 'consent_form'
        });
        const confirmScreen = new lab.html.Screen({
            content: failure_template
        });
        const sequence = new lab.flow.Sequence({
            content: [labScreen, confirmScreen],
        })

        let consent = false;
        let submitListener;
        labScreen.on('run', () => {
            const submitButton = document.getElementsByName('submit')[0];
            const form = document.forms.consent_form;
            const explained = form.elements.explained;
            const withdraw = form.elements.withdraw;
            const read_notes = form.elements.read_notes;
            const agree = form.elements.agree;
            submitListener = submitButton.addEventListener('click', e => {
                if (explained.value === 'yes'
                    && withdraw.value === 'yes'
                    && read_notes.value === 'yes'
                    && agree.value === 'yes')
                {
                    consent = true;
                }
            });
        });
        labScreen.on('end', () => {
            const submitButton = document.getElementsByName('submit')[0];
            submitButton.removeEventListener('click', submitListener);
        });
        confirmScreen.on('run', () => {
            if (consent) {
                confirmScreen.end();
            } else {
                document.getElementById('stop-button').style.display = 'none';
            }
        });

        return sequence;
    },
    auditionFiles: (template, audioFiles) => {
        const labScreen = new lab.html.Screen({
            content: template,
        });

        let playListener;
        let continueListener;
        labScreen.on('run', () => {
            const playButton = document.getElementById('play-audio');
            const continueButton = document.getElementById('continue');
            playListener = playButton.addEventListener('click', event => {
                const player = new Audio();
                let fileIndex = 0;
                const playAudio = () => {
                    if (fileIndex < audioFiles.length) {
                        player.src = "audio/" + audioFiles[fileIndex];
                        player.play();
                        fileIndex += 1;
                    } else {
                        playButton.disabled = true;
                        continueButton.disabled = false;
                    }
                }
                player.onended = playAudio;
                playAudio();
            });

            continueListener = continueButton.addEventListener('click', event =>
            {
                labScreen.end();
            })
        });
        labScreen.on('end', () => {
            const playButton = document.getElementById('play-audio');
            const continueButton = document.getElementById('play-audio');
            playButton.removeEventListener('click', playListener);
            continueButton.removeEventListener('click', continueListener);
        });
        return labScreen;
    }
};
});