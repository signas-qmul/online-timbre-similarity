requirejs(
    ['./experiment'],
    function(experiment)
{
    experiment.get().then(labJSExperiment => { labJSExperiment.run(); });
});