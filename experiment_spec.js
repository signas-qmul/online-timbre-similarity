const fs = require('fs');

function listAudioFiles() {
    const files = fs.readdirSync('client/audio');
    for (const file of files) {
        if (!file.endsWith('.wav')) {
            files.splice(files.indexOf(file), 1);
        }
    }
    return files;
}

function makeAllPairs(files) {
    const filePairs = [];
    for (let i = 0; i < files.length; i++) {
        for (j = i; j < files.length; j++) {
            const iFirst = Math.random() >= 0.5;
            const audioFileA = files[iFirst ? i : j];
            const audioFileB = files[iFirst ? j : i];

            filePairs.push([audioFileA, audioFileB]);
        }
    }
    return filePairs;
}

function shuffleList(list) {
    const outList = list;
    for (let i = 0; i < list.length; i++) {
        swapIndex = Math.floor(Math.random() * list.length);
        const swapValue = outList[i];
        outList[i] = outList[swapIndex];
        outList[swapIndex] = swapValue;
    }
    return outList;
}

function makeTrials() {
    const files = listAudioFiles();
    const filePairs = makeAllPairs(files);
    const shuffledPairs = shuffleList(filePairs);
    const trials = [];
    for (const pair of shuffledPairs) {
        trials.push({
            "audio_src_a": pair[0],
            "audio_src_b": pair[1]
        });
    }
    return trials;
}

function create() {
    const spec = {};
    const trials = makeTrials();
    spec.trials = trials;
    return spec;
}

module.exports = {create};