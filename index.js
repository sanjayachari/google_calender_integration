const express = require('express');
const passport = require('passport');
const { google } = require('googleapis');
const session = require('express-session');
const { OAuth2 } = google.auth;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

// Use express-session middleware
app.use(session({
  secret: 'your-secret-key', // Change this to a secure random string
  resave: true,
  saveUninitialized: true,
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Replace these with your actual Google OAuth credentials
// const GOOGLE_CLIENT_ID = "444451465392-m7b6tl3a1bl00gjvrqhapl92ictsrgp4.apps.googleusercontent.com";
const GOOGLE_CLIENT_ID = "146418200941-nj2sj3okqkck9n2reacpjmeggg160qmu.apps.googleusercontent.com";
// const GOOGLE_CLIENT_SECRET = "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";
const GOOGLE_CLIENT_SECRET = "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";


// Replace 'YOUR_CLIENT_ID' and 'YOUR_CLIENT_SECRET' with your Google API credentials
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback',
  },
  (accessToken, refreshToken, profile, done) => {
    // Store user information if needed
    return done(null, {
      profile,
      accessToken,
      refreshToken,
    });
  }
));

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.events'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/create-event')
);

// Route to create an event
// app.get('/create-event', async (req, res) => {
//   try {
//     if (!req.isAuthenticated()) {
//       return res.redirect('/auth/google');
//     }
    
//     // Use the authenticated user's credentials to create an event
//     const oauth2Client = new OAuth2(
//         GOOGLE_CLIENT_ID, // Replace with your client ID
//         GOOGLE_CLIENT_SECRET // Replace with your client secret
//     );

//     oauth2Client.setCredentials({
//       access_token: req.user.accessToken,
//       refresh_token: req.user.refreshToken,
//     });

//     // Check if the access token is expired
//     if (oauth2Client.isTokenExpiring()) {
//       const tokens = await oauth2Client.refreshAccessToken();
//       // Update req.user.accessToken with the new token
//       req.user.accessToken = tokens.res.data.access_token;
//     }

//     const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

//     const event = {
//         summary: 'test Title',
//         location: 'banglore',
//         description: 'test Description',
//         start: {
//           dateTime: '2024-01-15T10:00:00', // Replace with the actual start time
//           timeZone: 'Asia/Kolkata', // Replace with the actual time zone
//         },
//         end: {
//           dateTime: '2024-01-15T11:00:00', // Replace with the actual end time
//           timeZone: 'Asia/Kolkata', // Replace with the actual time zone
//         },
//         attendees: [
//           { email: 'sanjayacharya992@gmail.com' },
//           { email: 'devsanjay7676@gmail.com' },
//         ],
//       };
      

//     const createdEvent = await calendar.events.insert({
//       calendarId: 'primary',
//       resource: event,
//     });

//     console.log('Event created: %s', createdEvent.data.htmlLink);
//     res.send('Meeting scheduled successfully!');
//   } catch (error) {
//     console.error('Error creating event:', error.message);
//     res.status(500).send('Error scheduling the meeting.');
//   }
// });



// Route to create an event
app.get('/create-event', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('/auth/google');
    }
    
    // Use the authenticated user's credentials to create an event
    const oauth2Client = new OAuth2(
        GOOGLE_CLIENT_ID, // Replace with your client ID
        GOOGLE_CLIENT_SECRET // Replace with your client secret
    );

    oauth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken,
    });

    // Check if the access token is expired
    if (oauth2Client.isTokenExpiring()) {
      const tokens = await oauth2Client.refreshAccessToken();
      // Update req.user.accessToken with the new token
      req.user.accessToken = tokens.res.data.access_token;
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const event = {
        summary: 'test Title',
        location: 'banglore',
        description: 'test Description',
        start: {
          dateTime: '2024-01-15T10:00:00', // Replace with the actual start time
          timeZone: 'Asia/Kolkata', // Replace with the actual time zone
        },
        end: {
          dateTime: '2024-01-15T11:00:00', // Replace with the actual end time
          timeZone: 'Asia/Kolkata', // Replace with the actual time zone
        },
        attendees: [
          { email: 'sanjayacharya992@gmail.com' },
          { email: 'devsanjay7676@gmail.com' },
        ],
        conferenceData : {
            createRequest : {
                requestId : 1
            }
        }
      };
      

    const createdEvent = await calendar.events.insert({
    conferenceDataVersion : 1,

      calendarId: 'primary',
      resource: event,
    });

    console.log('Event created: %s', createdEvent.data.htmlLink);
    res.send('Meeting scheduled successfully!');
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).send('Error scheduling the meeting.');
  }
});




// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
