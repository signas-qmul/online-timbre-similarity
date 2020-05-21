requirejs.config({
    shim: {
        lab: {
            exports: 'lab'
        }
    },
    paths: {
        lab: '../lib/lab'
    }
});

define(['lab', 'templating'], function(lab, templating) {
return {
    dissimilarityScreen: (template, audioFiles) => {
        const first = Math.random() >= 0.5 ? 1 : 0;
        const audioFileA = audioFiles[first];
        const audioFileB = audioFiles[1 - first];

        const populatedTemplate = templating.populateScreenTemplate(
            template,
            {'audio_src_a': audioFileA, 'audio_src_b': audioFileB});
        
        const labScreen = new lab.html.Form({
            content: populatedTemplate
        });

        let playing = false;
        const playAudio = function() {
            playing = true;
            const playerA = document.getElementById("audio_a");
            const playerB = document.getElementById("audio_b");
            playerA.onended = () => { playerB.play() };
            playerB.onended = () => { playing = false; }
            playerA.play();
        }

        let playListener;
        labScreen.on('run', () => {
            playAudio();
            playListener = document.addEventListener('keypress', event => {
                if (event.key === 'r' && !playing) {
                    playAudio();
                }
            });

            const numberBox = document.getElementById('dissimilarity_rating');
            numberBox.focus();
            numberBox.onblur = () => { numberBox.focus(); };
        });

        labScreen.on('end', () => {
            document.removeEventListener('keypress', playListener);
        })
        

        return labScreen;
    }
};
});