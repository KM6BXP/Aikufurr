const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const port = 5001;
const fs = require('fs');
var Xray = require('x-ray');
var x_ray = Xray();
var bodyParser = require('body-parser');
var Sqrl = require('squirrelly');
//const secret = JSON.parse(fs.readFileSync(require("os").homedir() + "/secret", "utf8"));
var secret = "dev";

var procal = secret.env === "pro" ? "https" : "http";

app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/images', express.static(__dirname + '/public/images'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '5gb' }))
app.use(fileUpload());

function render(response, template, data) {
    var data = data != null ? data : {}
    response.send(Sqrl.Render(fs.readFileSync(`public/${template}`, `utf8`), data))
}

function customResponse(response, code) {
    if (code === 404) {
        response.status(404).send('<video preload="auto" autoplay="" loop style="width: 100%; height: 100%; position: absolute; background-color: black; top: 0%; left: 0%;" src="/images/404.mp4" type="video/mp4"></video>');
    }
}

var router = express.Router();
app.use('/api', router);

app.post('/upload', function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(`${__dirname}/public/upload/${req.files.sampleFile.name}`, function (err) {
        if (err)
            return res.status(500).send(err);

        res.redirect("/files")
    });
});

app.get("/upload", (req, res) => {
    res.send(`<html>
    <body>
      <form ref='uploadForm' 
        id='uploadForm' 
        action='/upload' 
        method='post' 
        encType="multipart/form-data">
          <input type="file" name="sampleFile" />
          <input type='submit' value='Upload!' />
      </form>     
    </body>
  </html>`)
});

app.get("/files/:file?", (req, res) => {

    if (req.params.file == null) {
        let filesOUT = "";
        fs.readdir(`${__dirname}/public/upload/`, (err, files) => {
            files.forEach((file) => {
                filesOUT += `<a href="/files/${file}">${file}</a><br><br>`
            })
            res.send(filesOUT)
        });
    } else {
        res.sendFile(`${__dirname}/public/upload/${req.params.file}`);
    }


});


// Backward Compatible API Fix
app.get('/fluffster/api/images/:data/:image', (req, res) => {
    res.sendFile(`${__dirname}/public/api/images/${req.params.data}/${req.params.image}`)
})

app.get("/", (req, res) => {
    render(res, 'html/index.html')
})

app.get("/projects/:project?/:sub1?/:sub2?/:sub3?", (req, res) => {
    if (req.params.project == null) {
        render(res, 'html/projects.html')
    } else if (req.params.project.toLowerCase() === "discord-bots") {
        if (req.params.sub1 == null) {
            render(res, 'html/projects/discord-bots/index.html')
        } else if (req.params.sub1.toLowerCase() === "foxobot") {
            render(res, 'html/projects/discord-bots/foxobot/index.html')
        } else if (req.params.sub1.toLowerCase() === "fluffster") {
            render(res, 'html/projects/discord-bots/fluffster/index.html')
        } else {
            customResponse(res, 404);
        }
    } else if (req.params.project.toLowerCase() === "api") {
        if (req.params.sub1 == null) {
            render(res, 'html/projects/api.html')
        } else {
            customResponse(res, 404);
        }
    } else if (req.params.project.toLowerCase() === "snippits") {
        if (req.params.sub1 == null) {
            render(res, 'html/projects/snippits.html')
        } else {
            customResponse(res, 404);
        }
    } else {
        customResponse(res, 404);
    }
})


app.get('*', function (req, res) {
    customResponse(res, 404);
});


/* ####### API ####### */

router.post('*', function (req, res) {
    res.status(405).json({
        error: "API is GET only"
    });
});

router.get('/', function (req, res) {
    res.json([`${procal + '://' + req.get('host')}/api/images`]);
});

router.get("/images/:data?/:image?", (req, res) => {
    if (req.params.data == null) {
        fs.readdir("public/api/images/", (err, files) => {
            if (err) {
                console.log("Unable to scan dir: " + err);
                return
            }
            let dirs = [];
            files.forEach((dir) => {
                dirs.push(`${procal + '://' + req.get('host')}/api/images/${dir}`);
            })
            res.json(dirs);
        })

    } else if (req.params.image == null) {
        if (fs.existsSync(`public/api/images/${req.params.data}`)) {
            fs.readdir(`public/api/images/${req.params.data}`, (err, files) => {
                if (err) {
                    console.log("Unable to scan dir: " + err);
                    return
                }

                let file = files[Math.floor(Math.random() * files.length)];

                res.json(`${procal + '://' + req.get('host')}/api/images/${req.params.data}/${file}`);
            })
        } else {
            res.send("");
        }
    } else {
        res.sendFile(`${__dirname}/public/api/images/${req.params.data}/${req.params.image}`)
    }
})

router.get("/ytdl/:version?", (req, res) => {
    if (req.params.version == null) {
        fs.readdir("public/api/ytdl/", (err, files) => {
            if (err) {
                console.log("Unable to scan dir: " + err);
                return
            }
            let dirs = [];
            files.forEach((dir) => {
                dirs.push(`${procal + '://' + req.get('host')}/api/ytdl/${dir}`);
            })
            res.json(dirs.pop());
        })
    } else {
        res.sendFile(`${__dirname}/public/api/ytdl/${req.params.version}`)
    }
})
app.listen(port, () => console.log(`app listening on port ${port}!`))