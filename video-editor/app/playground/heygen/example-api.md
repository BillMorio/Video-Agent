```curl --request POST \
     --url https://api.heygen.com/v2/video/generate \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --header 'x-api-key: <your-api-key>' \
     --data '
{
  "caption": true,
  "title": "string",
  "callback_id": "string",
  "video_inputs": [
    {
      "character": {
        "type": "avatar",
        "avatar_id": "string",
        "talking_photo_id": "string",
        "scale": 1,
        "avatar_style": "normal",
        "talking_photo_style": "circle",
        "use_avatar_iv_model": true,
        "offset": {
          "x": 0,
          "y": 0
        },
        "talking_style": "stable",
        "expression": "default",
        "super_resolution": true,
        "matting": true,
        "circle_background_color": "string"
      },
      "voice": {
        "type": "text",
        "voice_id": "string",
        "input_text": "string",
        "speed": 0,
        "pitch": 0,
        "emotion": "Excited",
        "locale": "string",
        "elevanlabs_settings": {
          "model": "eleven_monolingual_v1",
          "similarity_boost": 0,
          "stability": 0,
          "style": 0
        },
        "audio_url": "string",
        "audio_asset_id": "string",
        "duration": "1"
      },
      "background": {
        "type": "color",
        "value": "#FFFFFF",
        "url": "string",
        "image_asset_id": "string",
        "video_asset_id": "string",
        "play_style": "freeze",
        "fit": "cover"
      },
      "text": {
        "type": "text",
        "text": "string",
        "font_family": "string",
        "font_size": 0,
        "font_weight": "bold",
        "color": "string",
        "position": {
          "x": 0,
          "y": 0
        },
        "text_align": "left",
        "line_height": 0,
        "width": 0
      }
    }
  ],
  "dimension": {
    "width": 0,
    "height": 0
  },
  "folder_id": "string",
  "callback_url": "string"
}
'```


Some text from the video generation Page:

Generates videos using the AI Studio backend with support for avatars, voices, and dynamic backgrounds. You can create videos using either your video avatar or photo avatar. This endpoint supports Avatar III and Avatar IV.

Recent Requests
Log in to see full request history
Time	Status	User Agent	
Make a request to see history.
0 Requests This Month
📘
Note:

Scroll down to the Responses section below and expand the status code(s) to view the detailed response schema.
Refer to the RESPONSE section on the right and choose an example to see how the API response appears for each status code.
Body Params
caption
boolean
Defaults to false
Whether to enable captions in the video. Only supported for text-based input.
true
title
string
Title of this video

string
callback_id
string
Custom ID for callback purposes. Returned in the status/webhook payload for tracking.

string
video_inputs
array of objects
required
Array of video input settings (scenes). Must contain between 1 to 50 items. A video input describes the avatar, background, voice, and script, which together equals a 'scene'.


object

character
object
Could be an avatar or talking photo.


character object
voice
object
Could be text, audio, or silence.

voice object
background
object
Could be color, image, or video.

background object
text
object
Text displayed on the screen.

text object

ADD object
dimension
object
Custom dimensions for the output video.

dimension object
folder_id
string
Unique identifier of the folder where the video is stored. Can be retrieved from the List Folders endpoint if folder already exists, or from the response of the Create Folder endpoint after creating a new folder.

string
callback_url
string
URL to notify when video rendering is complete, useful when your callback endpoint is dynamic and each video requires a separate callback. Using a webhook endpoint is still the recommended approach, as it provides more customization options such as secrets, event filtering, and more. If both webhook and callback_url are used, events will be sent to both endpoints.

string
Responses

200
Video creation initiated successfully - Expand to view the detailed response schema.
400
Invalid parameters:
circle_background_color must be in hex format.
Either url or image_asset_id needs to be provided.
Either audio_url or audio_asset_id needs to be provided.
Updated 4 days ago

Create with Video Agent
