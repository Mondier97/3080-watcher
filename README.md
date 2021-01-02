# 3080-watcher

A simple node.js application built with typescript to watch www.nowinstock.net and email a user
when an nvidia 3080 graphics card becomes available for purchase. I've been trying to buy one
for a while and this is my likely futile attempt to secure one without resorting to counter
scalping.

# Running the App

The app uses sendgrid in order to send emails. You can sign up at 
https://sendgrid.com/ and send small volumes of emails for free. The app also 
expects a .env file to exist with SENDGRID_API_KEY and USER_EMAIL environment 
variables