const express = require('express');
const body_parser = require('body-parser');
const mongodb = require('mongodb');
const experiment_spec = require('./experiment_spec');

const QUESTIONNAIRE_COLLECTION = 'questionnaire_responses';
const PRACTICE_COLLECTION = 'practice_dissimilarity_responses';
const DISSIMILARITY_COLLECTION = 'dissimilarity_responses';
const EXPERIMENT_SPEC_COLLECTION = 'experiment_specs';

const app = express();
app.use(body_parser.json());
app.use(express.static('client'));

mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test", function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  db = client.db();
  console.log("Database connection ready");

  var server = app.listen(process.env.PORT || 8081, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

app.get('/api/get-experiment-spec', function(req, res) {
    const spec = experiment_spec.create();

    db.collection(EXPERIMENT_SPEC_COLLECTION)
        .insertOne(spec, (err, doc) => {
            if (err) {
                handleError(res, err.message, "Failed to insert spec to DB");
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify(spec));
            }
        });
});

app.get('/data/dissimilarity_scores.csv', function(req, res) {
    const cols = [
        'spec_id',
        'audio_a',
        'audio_b',
        'dissimilarity_rating',
        'response_time'
    ];
    let csv_string = cols.join(',') + '\n';

    db.collection(DISSIMILARITY_COLLECTION)
        .find().toArray((err, docs) => {
            for (const row of docs) {
                const data = [
                    row.specId,
                    row.audio_a_file,
                    row.audio_b_file,
                    row.dissimilarity_rating,
                    row.duration
                ];
                csv_string += data.join(',') + '\n';
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(csv_string);
        });
});

app.get('/data/questionnaire_responses.csv', function(req, res) {
    const cols = [
        'spec_id',
        'age',
        'gender',
        'hearing_issue',
        'instrument_years',
        'primary_instrument',
        'response_time'
    ];
    let csv_string = cols.join(',') + '\n';

    db.collection(QUESTIONNAIRE_COLLECTION)
        .find().toArray((err, docs) => {
            for (const row of docs) {
                const data = [
                    row.specId,
                    row.age,
                    row.gender,
                    row.hearing_issue,
                    row.instrument_years,
                    row.primary_instrument,
                    row.duration
                ];
                csv_string += data.join(',') + '\n';
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(csv_string);
        });
});

app.post('/api/store-experiment-data', function(req, res) {
    const specId = req.body.metadata.specId;
    const questionnaireResponses = [];
    const practiceResponses = [];
    const dissimilarityResponses = [];

    for (const entry of req.body.data) {
        entry.specId = specId;
        if (entry.sender === 'dissimilarity') {
            dissimilarityResponses.push(entry);
        } else if (entry.sender === 'questionnaire') {
            questionnaireResponses.push(entry);
        } else if (entry.sender === 'practice_dissimilarity') {
            practiceResponses.push(entry);
        }
    }

    const dbOperations = [];
    if (dissimilarityResponses.length > 0) {
        dbOperations.push(db.collection(DISSIMILARITY_COLLECTION)
            .insertMany(dissimilarityResponses));
    }
    if (practiceResponses.length > 0) {
        dbOperations.push(db.collection(PRACTICE_COLLECTION)
            .insertMany(practiceResponses));
    }
    if (questionnaireResponses.length > 0) {
        dbOperations.push(db.collection(QUESTIONNAIRE_COLLECTION)
            .insertMany(questionnaireResponses));
    }

    Promise.all(dbOperations)
        .then((returns) => {
            let success = true;
            for (const res of returns) {
                if (res.result.ok !== 1) {
                    handleError(
                        res,
                        err.message,
                        "Failed to insert responses to DB");
                    success = false;
                    break;
                }
            }
            if (success) res.sendStatus(201);
        })
        .catch((err, doc) => {
            handleError(res, err.message, "Failed to insert responses to DB");
        });
});