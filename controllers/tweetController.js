const { Tweet, Reply, User, Followship, Like } = require('../models')
const { getUser } = require('../_helpers')

function formatDate(date) {
  function twoDigits(num) {
    if (num > 10) return num
    return '0' + num.toString()
  }
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const AMorPM_string = hours < 12 ? '上午' : '下午'

  return `${AMorPM_string}${twoDigits(hours)}:${twoDigits(minutes)} • ${year}年${month}月${day}日`
}

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll(
      {
        include: [
          User,
          Reply,
          // Like
        ],
        order: [['createdAt', 'DESC']]
      }
    ).then((tweets) => {
      const pageTitle = '首頁'
      const isUserPage = true;
      tweets = tweets.map(d => {
        return {
          ...d.dataValues,
          name: d.User.name,
          account: d.User.account,
          replyAmount: d.Replies.length
        }
      })
      res.render('tweets', { tweets, pageTitle, isUserPage })
    })
      .catch(e => {
        console.warn(e)
      })
  },
  getTweet: (req, res) => {
    const tweet_id = req.params.id

    Tweet.findOne(
      {
        where: { id: tweet_id },
        include: [User, Reply]
      }
    ).then((tweet) => {
      // console.log(tweet.Replies)
      const pageTitle = '推文'
      const time = formatDate(tweet.createdAt)
      res.render('tweet', { tweet: tweet.toJSON(), pageTitle, time })
    })
      .catch(e => {
        console.warn(e)
      })
  },

  likeTweet: (req, res) => {
    const loginUser = getUser(req)
    //不能重複喜歡
    Like.findOne({
      where: {
        UserId: loginUser.id,
        TweetId: req.params.id
      }
    })
      .then(like => {
        if (like) {
          req.flash('warning_msg', 'You cannot like the same tweet twice')
          return res.redirect('back')
        }
        return Like.create({
          UserId: loginUser.id,
          TweetId: req.params.id
        })
          .then(() => res.redirect('back'))
          .catch(err => res.send(err))
      })
  },
  unlikeTweet: (req, res) => {
    const loginUser = getUser(req)
    Like.destroy({
      where: {
        UserId: loginUser.id,
        TweetId: req.params.id
      }
    })
      .then(() => {
        return res.redirect('back')
      })
      .catch(err => res.send(err))
  },

  //popup
  getAddTweet: (req, res) => {

  },
  addTweet: (req, res) => {
    const user_id = getUser(req).id
    const { description } = req.body

    Tweet.create(
      {
        UserId: user_id,
        description
      }
    ).then(() => {
      res.redirect('back')
    })
      .catch(e => console.warn(e))
  },
  addReply: (req, res) => {
  }
}


module.exports = tweetController