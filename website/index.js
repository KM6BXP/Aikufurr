const express = require('express');
const app = express();
const port = 5001;
const fs = require('fs');
var Xray = require('x-ray');
var x_ray = Xray();
var bodyParser = require('body-parser');
var Sqrl = require('squirrelly');
const secret = JSON.parse(fs.readFileSync(require("os").homedir() + "/secret", "utf8"));

var procal = secret.env === "pro" ? "https" : "http";

app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/images', express.static(__dirname + '/public/images'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

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


app.get("/this-dead-winter", (req, res) => {
    x_ray('https://www.kickstarter.com/projects/robertpotter/this-dead-winter', '.ksr-green-500')((e, current) => {
        var json = { current: 0 };

        json.current = parseInt(current.split('£')[1].replace(",", ""))

        json.need = json.total - json.current;
        json.switch = 45000 - json.current;
        json.music = 60000 - json.current;
        json.multi = 75000 - json.current;
        json.puzzles = 92000 - json.current;
        json.spirits = 104000 - json.current;

        let images = [
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569623749075-4E2RP896AD2E6QVACQCB/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/1.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569623734677-4WSTFQAFCN0WM07AVYEY/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/2.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569623813543-EI3WSOXZN5WCM0EWI0EB/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/3.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569623831423-BO6BW2OL3G5XV89TYR59/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/4.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569623879624-Q5O8O8278K4OSXTV6VL8/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/5.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569623894285-7DH3CNN17EMGITKAC4V7/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/6.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569623948341-CEIDOSS8GVJ180NWBRGF/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/7.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569623955450-MBMGVC862N3X7IJP3YBT/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/8.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569624011700-L0WIXAZ4OZXFYEKSEOXF/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/9.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569624006204-JAI86VJS2U8FR6NYSRM2/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/10.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569624060599-1MXKFPQHOS2DBZL6OIFO/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/11.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569624081581-0AS4ECO4CM8UD90ZNMY0/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/12.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569624111207-PYR2ZPW2EJ123V7Z7576/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/13.png",
            "https://images.squarespace-cdn.com/content/v1/5d431d97d0d7d800016c6fc2/1569624138226-S9JY2XZ6H29WAZ42D5HN/ke17ZwdGBToddI8pDm48kPTrHXgsMrSIMwe6YW3w1AZ7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p52bY8kZn6Mpkp9xtPUVLhvLurswpbKwwoDWqBh58NLxQZMhB36LmtxTXHHtLwR3w/14.png"
        ];

        let renderHTML = `<!doctype html>
<html lang="en">

<head>
    <title>This Dead Winter Money Tracker</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <style>
html,
body {
    height: 100%;
    background-image: url("${images[Math.floor(Math.random()*images.length)]}");
    background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Do not repeat the image */
  background-size: cover; /* Resize the background image to cover the entire container */
}

.container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
span {
    text-shadow: 2px 2px 10px orange;
    font-weight: bold;
}</style>
</head>

<body>
<div class="container">
    <div class="container-fluid text-center">
        <div class="row">
        <div class="col-md-3">
        <h2><span>Switch Port: £${json.switch}</span></h2>
        </div>
        <div class="col-md-3">
        <h2><span>Physical Music: £${json.music}</span></h2>
        </div>
        <div class="col-md-3">
        <h2><span>Multiplayer: £${json.multi}</span></h2>
        </div>
        <div class="col-md-3">
        <h2><span>Extra Puzzles: £${json.puzzles}</span></h2>
        </div>
        <div class="col-md-3">
        <h2><span>Extra Spirits: £${json.spirits}</span></h2>
        </div>
        </div>
        <div class="row">
            <div class="col-md-12">
            <h3><span>Current: £${json.current}</span></h3>
            </div>
        </div>
    </div>
</div>
</body>
</html>`
        res.send(renderHTML);
    })
})

app.get('*', function(req, res) {
    customResponse(res, 404);
});


/* ####### API ####### */

router.post('*', function(req, res) {
    res.status(405).json({
        error: "API is GET only"
    });
});

router.get('/', function(req, res) {
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
        fs.readdir(`public/api/images/${req.params.data}`, (err, files) => {
            if (err) {
                console.log("Unable to scan dir: " + err);
                return
            }

            let file = files[Math.floor(Math.random() * files.length)];

            res.json(`${procal + '://' + req.get('host')}/api/images/${req.params.data}/${file}`);
        })
    } else {
        res.sendFile(`${__dirname}/public/api/images/${req.params.data}/${req.params.image}`)
    }
})

app.listen(port, () => console.log(`app listening on port ${port}!`))