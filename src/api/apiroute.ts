const apiRoute = require("express").Router();
var HttpStatus = require('http-status-codes');
var aad     = require('azure-ad-jwt');
var logger = require("../utils/loghelper").logger;


var reader_role = process.env.READER;
var writer_role = process.env.WRITER;
var audience = process.env.AUDIENCE;

/*
* use adds a middleware where this function is called in every call. it gives us a chance to print out what we are
* getting for debugging reasons, but needs to be removed once we have everything working in production
*/

apiRoute.use(function(req, res, next) {
    const authzHeader = req.headers.authorization;

    if (!authzHeader) {
      return res.status(403).json({ error: 'No credentials sent!' });
    }
    req.token = authzHeader.split(' ')[1];
    next();
});

apiRoute.use(function timeLog(req, res, next) {
    var date = new Date();

    console.log(`route Got request ${req.method} at time`, date.toLocaleString());
    next();
});


apiRoute.route('/first')

    .get(function(req, res) {
        checkReader(req.token)
        .then(function(result) {
            if (result) {
                return res.json({message: "first"});
            }
            else {
                return res.status(403).json({ error: 'Not in reader role' });
            }
        });
    })
    .post(function(req, res) {
        checkWriter(req.token)
        .then(function(result) {
            if (result) {
                return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({message: "post not allowed"});
            }
            else {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Not in writer role' });
            }
        });
    });

apiRoute.route('/second')
    .get(function(req, res) {
        checkReader(req.token)
        .then(function(result) {
            if (result) {
                return res.json({message: "second"});
            }
            else {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Not in reader role' });
            }
        });
    })
    .post(function(req, res) {
        checkWriter(req.token)
        .then(function(result) {
            if (result) {
                return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({message: "post not allowed"});
            }
            else {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Not in writer role' });
            }
        });

    });


apiRoute.route('/third')
    .get(function(req, res) {
        logger.info("in third");
        checkReader(req.token)
        .then(function(result) {
            if (result) {
                return res.json({message: "third"});
            }
            else {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Not in reader role' });
            }
        });
    })
    .post(function(req, res) {
        checkWriter(req.token)
        .then(function(result) {
            if (result) {
                return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({message: "post not allowed"});
            }
            else {
                return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Not in writer role' });
            }
        });

    });


async function checkReader(token) {
    
    var result:any = await verifyanddecodetoken(token);
    logger.info("roles is %o", result.roles);

    if (result.roles && (result.roles.includes(reader_role)||result.roles.includes(writer_role))) {
        logger.info("roles return reader true");
        return true;
    }
    else {
        logger.info("roles return reader false");

        return false;
    }
    
}

async function checkWriter(token) {
    
    var result:any = await verifyanddecodetoken(token);
    logger.info("roles is %o", result.roles);

    if (result.roles && result.roles.includes(writer_role)) {
        logger.info("roles return writer true");
        return true;
    }
    else {
        logger.info("roles return writer false");
        return false;
    }
    
}

async function verifyanddecodetoken(token) {

    var jwtToken = token;

    return new Promise(function(resolve, reject) {
        aad.verify(jwtToken, {audience: audience}, function(error, result) {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

module.exports = apiRoute;
