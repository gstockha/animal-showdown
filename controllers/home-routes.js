const router = require('express').Router();
const sequelize = require('../config/connection');
const { Comment, Vote, Matchup } = require('../models');
const auth = require('../utils/auth');

router.get('/', auth, (req, res) => { //load random matchup
  const user_id = req.session.user_id; //doesn't work for now?
  console.log(user_id)
  const matchup_id = Math.floor(Math.random() * 12) + 1;
  Matchup.findOne({where: {id: matchup_id}})
  .then(matchupData =>{
      if (matchupData !== null){ //matchup exists
          Vote.findOne({where: {matchup_id, user_id}})
          .then(voteSearch =>{
              const hasVoted = (voteSearch !== null); //user hasVoted true or false
              Vote.findAll({
                  where: {matchup_id},
                  attributes: ['vote'] //only need to know the vote counts
              })
              .then(voteData =>{
                  Comment.findAll({
                      where: {matchup_id},
                      attributes: ['comment', 'color', 'username', 'createdAt'],
                      raw: true
                      //users only need to know these
                  })
                  .then(comments =>{
                      let blues = 0
                      for (let i = 0; i < voteData.length; i++){
                          if (voteData[i].vote === 1) blues++;
                      }
                      const reds = voteData.length - blues;
                      const animal_1 = matchupData.animal_1;
                      const animal_2 = matchupData.animal_2;
                      const date = new Date().getFullYear();
                      res.render('home', {layout:'main', date, hasVoted, animal_1, animal_2, blues, reds, comments, matchup_id});
                  })
                  .catch(err => {
                      console.log('Comment data not found!');
                      res.status(500).json(err);
                  })
              })
              .catch(err => {
                  console.log('Vote data not found!');
                  res.status(500).json(err);
              })
          })
          .catch(err => {
              console.log('Matchup data not found!');
              res.status(500).json(err);
          })
      }
      else res.status(409).json('No matchup with that ID!');
  })
  .catch(err => {
      console.log('Matchup data not found!');
      res.status(500).json(err);
  })
  .catch((err) => {
    console.log("Matchup data not found!");
    res.status(500).json(err);
  });
});

// directs user to login page
router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
      res.redirect('/');
      return;
    }
  
    res.render('login', {layout:'main'});
});


module.exports = router;