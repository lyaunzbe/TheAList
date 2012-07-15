var twitter = require('ntwitter');
var config = require('../config');

var twit = new twitter({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret
});

var _ = require('underscore');
/*
 * GET home page.
 */

exports.show = function(req, res){
  var handle = req.session.results.screen_name;
    getTData(handle, req.session.oauth,function(err, data){
    if(err){
      console.log(err);
      return res.render('index.html', {err : err, handle: handle})
    }
		var locals = {
			title : 'The A List',
      handle : req.session.results.screen_name,
		    tData : JSON.stringify(
		    	data
		    )
		 };
		res.locals = locals;
		res.render('index.html', locals);
	});
};

// exports.post = function(req, res){
//   console.log(req.body);
//   getTData(req.body.handle, req.session.oauth, function(err, data){
//     if(err){
//       return res.render('index.html', {err : "Too many twitter API calls. Come back later."})
//     }
//     var locals = {
//       title : 'The A List',
//       handle: req.body.handle,
//         tData : JSON.stringify(
//           data
//         )
//      };
//     res.locals = locals;
//     res.render('index.html', locals);
//   });
// };

exports.landing = function(req, res){
  res.render('landing.html');
}

function getTData(handle,oauth,callback){
  
  twit.options.access_token_secret = oauth.access_token_secret;
  twit.options.access_token_key = oauth.access_token;
  console.log(oauth);
  console.log(twit);
  twit.verifyCredentials(function (err, data) {
    if(err) console.log(err);
    console.log(data);
  }).getFollowersIds(handle, function(err, data1){
      if(err){
        console.log(err);
        callback(err);
      }else{
    		twit.getFriendsIds(handle, function(err, data2){
    			// console.log('FRIENDS\n', data2);
    			// console.log('FOLLOWERS\n', data1);
          // if(err) callback(err);
    			var data3 = _.intersection(data1, data2);
          if(data3.length > 50){
              data3 = _.first(data3, 50);
          }else if(data3.length == 0){
            callback('Looks like you have no friends, bro...');
          }
    			twit.showUser(data3, function(err,data4){
    				var data5 = [];
    				_.each(data4, function(o){
    					data5.push(_.pick(o, 'screen_name','followers_count'));
    				});

            data5 = _.sortBy(data5, function(o){
              return o.followers_count;
            }).reverse();
            
            console.log(data5,'\n\n',data5.length);
    				callback(null, data5);
    			})
    		})
      }
  	})	
}