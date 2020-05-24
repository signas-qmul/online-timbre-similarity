requirejs(
    ['./experiment'],
    function(experiment)
{
    experiment.get().then(({fullSequence, experiment}) => {
        const stopButton = document.getElementById('stop-button');
        stopButton.addEventListener('click', event => {
            const cancel = confirm("Are you sure you want to stop the experiment?")
            if (cancel) experiment.end();
            stopButton.blur();
        });
        fullSequence.run();
    });
});