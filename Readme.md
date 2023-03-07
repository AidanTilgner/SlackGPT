# SlackGPT

## Description
**SlackGPT** is a Slack Bolt App which acts as a proxy between you and ChatGPT. This repository is all the code you need to run your own instance of SlackGPT.

## Notes
* We are not affiliated or promoted by Slack or OpenAI. We are a third party and we use both the Slack and OpenAI APIs.
* We want these instructions to be as clear as possible, so if you have any questions, or feel that things should be clarified, feel free to open an issue on this repository.
* We would be happy to see improvements to the repo. If you have any ideas, feel free to open a pull request.
* If you have questions or concerns, don't be shy! Feel free to open an issue on this repository about anything.

## Setup
Setting up the Slack app is unfortanately a fairly complex process, as running a Slack application requires a lot of steps. However, we'll provide all of the steps you should need to get your own instance of SlackGPT up and running.

### Slack App Initialization
The first thing you'll have to do is initialize a new Slack App. You'll do this by going to the [Slack App Directory](https://api.slack.com/apps) and clicking the "Create New App" button. You'll then be prompted to enter a name for your app, and the workspace you want to add it to. Once you've done that, you'll be taken to the app's dashboard.

Once you've created the app, we'll want to add some features to it, but before we can do that, we'll need to set some things up.

### Setting up the App
First, you'll want to clone this repository onto your computer. This will use the following command:
```bash
git clone https://github.com/AidanTilgner/SlackGPT /path/to/your/directory
```

Next, you'll want to install dependencies for the app. This will be done with the [pnpm package manager](https://pnpm.io/installation). You can install it with the following command:
```bash
npm install -g pnpm
```
Once it is installed on your computer, you can install the dependencies with the following command:
```bash
pnpm install
```

Two more things before we can run our App:
1) Environment Variables
2) Deployment

#### Environment Variables
For the Slack app to run, we'll need to initialize some variables that are specific to your environment. We'll do this by creating a new file called `.env` in the root directory of the project. This file will contain all of the environment variables that are needed to run the app. First, create the fie with the following command:
```bash
touch .env
```
Then, open the file and add the following lines:
```bash
SLACK_SIGNING_SECRET=""
SLACK_APP_TOKEN=""
SLACK_BOT_TOKEN=""

PORT=3000 # The port that the app will run on
NODE_ENV="development" # or "production", depending on deployment status

INITIAL_CHATGPT_PROMPT="You are a helpful Slack bot." # The initial prompt for your ChatGPT instance
```
Now that we have the file, we'll need to add values for some of these, mainly the ones that start with `SLACK_`. You can do this by finding the following values in the Slack App Dashboard. Start by going to [the app dashboard](https://api.slack.com/apps), and finding "Basic Information" on the left side of the screen.

* SLACK_SIGNING_SECRET - Scroll down to "App Credentials" and copy the "Signing Secret" value. Paste it into the corresponding line in the `.env` file.
* SLACK_APP_TOKEN - Scroll further down to "App-Level Tokens", and click on "Generate Token and Scopes". Here, give your token a name, such as `xapp`, then a scope. A scope is going to give permission to your Slack app to perform some functionality. SlackGPT requires the `connections:write` scope, so add that before generating your token. Copy the token that is generated, and paste it into the corresponding line in the `.env` file.

Now, we'll need to navigate to "OAuth & Permissions" on the left side of the screen. Here you will see a section called "OAuth Tokens for Your Workspace".
* SLACK_BOT_TOKEN - Find the field called "Bot User OAuth Access Token", and copy it's value. Paste it into the corresponding line in the `.env` file.

#### Development Deployment
Now that we have all of the environment variables working. Try running the app with the following command:
```bash
pnpm start
```

If you don't recieve any errors, then you're good to go. Otherwise, go back through the steps and make sure you didn't miss anything. If you're still having issues, feel free to open an issue on this repository.

**For Development's sake*, we're going to use Ngrok. That way we can test our app in real time without having to deploy it every time we make a change. First, you'll want to get started with Ngrok:
1) Sign up for an account [here](https://ngrok.com/)
2) Follow "Getting Started" instructions [here](https://dashboard.ngrok.com/get-started/setup)
3) In a new terminal window, run the following command:
```bash
ngrok http 3000
```
Keep in mind, the port specified, in this case `3000`, is the port that you specified in the `.env` file. If you changed it, make sure to change it here as well.

Once you run that command, you should be given an ngrok url. Copy the value of this "Forwarding" url, and we'll use it in our next steps. Also, keep in mind that this is assuming you didn't stop your previous `pnpm run start` command. If you did, you'll need to restart it. Basically think of ngrok as forwarding an actual URL to your local machine. So whatever is running on the port that you specific to it, the new url will point to.

### Configuring Events
We're almost done I promise! Now that your app is deployed to a URL, we can start adding some event subscriptions. To do this, go to [your app's dashboard](https://api.slack.com/apps), and click on "Event Subscriptions" from the sidebar.

1) Next, you'll want to enable events. To do this, toggle the switch to the right of "Enable Events".
2) Second, it'll prompt you for your Request URL. This is the URL that Slack will send events to. Paste the ngrok url that you copied earlier into the field, and add `/slack/events` to the end of it. So if your ngrok url is `https://123456.ngrok.io`, then your Request URL will be `https://123456.ngrok.io/slack/events`. It will then attempt to verify this URL, and if the previous steps worked correctly, it should be successful.
3) Third, you'll want to scroll down to the "Subscribe to bot events" section. Here, you'll want to add some events, using the "Add Bot User Event" button.
    * `message.channels` - A message was posted to a public channel
    * `message.groups` - A message was posted to a private channel
    * `message.im` - A message was posted in a direct message channel
    * `message.mpim` - A message was posted in a multiparty direct message channel
    * `app_mention` - Subscribe to only the message events that mention your app or bot
4) Finally, make sure to hit the **"Save Changes"** button on the bottom right. I missed it plenty of times the first time.


### Configuring Interactivity
This is going to be very similar to the previous step. Go to [your app's dashboard](https://api.slack.com/apps), and click on "Interactivity & Shortcuts" from the sidebar. Then, we're going to do the following:
1) Toggle the switch to the right of "Interactivity"
2) Add a request URL, which should be the **exact same URL as the Event Subscription url**
3) Hit the **"Save Changes"** button on the bottom right.

Now, this will allow interactive components to work, which will be used to let users enter their API keys.


### Configuring Slash Commands
Similar to the first two steps, we're going to configure slash commands. Go to [your app's dashboard](https://api.slack.com/apps), and click on "Slash Commands" from the sidebar. Then, we're going to do the following:
1) Click on the "Create New Command" button
2) Fill in the properties for a new command called `/removekeys`. Keep in mind the the "Request URL" should be the **exact same URL as the Event Subscription url**. The rest of the properties can be whatever you want. The things that matter here are the "Request URL" and the name of the command, which must be `/removekeys`.
3) Hit the **"Save"** button on the bottom right.


### Configuring OAuth & Permissions
Lastly, we're going to configure OAuth & Permissions. Go to [your app's dashboard](https://api.slack.com/apps), and click on "OAuth & Permissions" from the sidebar. Then, we're going to do the following:
1) Scroll down to "Scopes", and click on the "Add an OAuth Scope" button
2) Add `app_mentions:read`
3) Add `channels:history`
4) Add `chat:write`
5) Add `commands`
6) Add `groups:history`
7) Add `im:history`
8) Add `mpim:history`

### Production Deployment
There are too many deployment strategies for us to pick one. Here are some resources to get you started deploying for production:
* [Deploy Slack Bolt app to Heroku](https://slack.dev/bolt-js/deployments/heroku)
* [Deploy Slack Bolt app to AWS Lambda](https://slack.dev/bolt-js/deployments/aws-lambda)
* [Manual Deployment with Nginx and DigitalOcean](https://gist.github.com/bradtraversy/cd90d1ed3c462fe3bddd11bf8953a896)

### Installation
If you haven't already, make sure to install your Slack app to your work space from the "Basic Information" or "Install App" sections of your [app's dashboard](https://api.slack.com/apps). You also may want to reinstall after changes have been made. Also note that you may want to reload your Slack window after changes have been made.

### Congratulations!
You're all done with setup. Now you can test your app to see if it works for you. There is some basic usage information below.

## Usage
### Api Keys
When you initially call @<yourappname>, if it doesn't have an openai api key for you, it will prompt you to enter one with a text box. Once it has one on file for you, it will use that for subsequent calls. If you want to change your key, you can use the `/removekeys` command, which will remove all of your keys from the database. Then, you can call @<yourappname> again, and it will prompt you to enter a new key.

### Prompts
To prompt ChatGPT, you'll use the following syntax in a Slack channel where your app is invited.

@<yourappname> prompt: <prompt>

Then, the app will respond with a ChatGPT generated response, and keep track of your conversation history.

### Commands
There is only one command for now, `removekeys`. To use it, simple type in a Slack window where your app is installed: `/removekeys`. By confirming and entering this command, all of **your own** API keys will be removed from the database.