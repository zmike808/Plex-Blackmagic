/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(event_request) {
  let logger = [] // the logger
  let request = new Request(event_request)
  let rurl = new URL(request.url)
  let sparams = new URLSearchParams(rurl.searchParams)

  // log this request
  let pmap = new Map(sparams)
  let pobj = Object.fromEntries(pmap)
  logger.push(rurl.toString())
  logger.push(pobj)

  // set the parameters we need
  let plexAdjust = parseInt(sparams.get('autoAdjustQuality', '0'))
  let plexPath = sparams.get('path', '')
  let changed = false

  /**
   * 
   * @param {parameters} The paramters of the original request. 
   * @param {*} The option to change inside the parameters.
   * @param {*} The value to change the option to.
   */
  function changeOption(option, value) {
    option = option.toString()
    if (sparams.has(option)) {
      original_value = sparams.get(option)
      if (original_value != value) {
        sparams.set(option, value)
        logger.push(`> Changed ${option} from ${original_value} to ${value}.`)
        changed = true
      }
    }
  } 

  // force direct stream for live tv
  if (plexPath.includes('/livetv/sessions')) {
    changeOption('directStream', '1')
    changeOption('directStreamAudio', '1')
    changeOption('autoAdjustQuality', '0')
  }

  // auto adjust bitrate
  if (plexAdjust == 1) {
    let bitrate = '40000'
    videoBitrate = parseInt(sparams.get('videoBitrate', '0'))
    maxVideoBitrate = parseInt(sparams.get('maxVideoBitrate', '0'))

    // auto set the bitrate to 40mbps
    if (videoBitrate == 2000 || videoBitrate == 3000 || videoBitrate == 4000) {
      changeOption('videoBitrate', bitrate)
    }
    if (maxVideoBitrate == 2000 || maxVideoBitrate == 3000 || maxVideoBitrate == 4000) {
      changeOption('maxVideoBitrate', bitrate)
    }

    // we also have to modify the bitrate limitations of the plex client here
    if (changed) {
      if (sparams.has('X-Plex-Client-Profile-Extra')) {
        let extras = sparams.get('X-Plex-Client-Profile-Extra')
        extras = extras.replace(
          /name=video.bitrate&value=[^&]+/gi,
          `name=video.bitrate&value=${bitrate}`,
        )
        changeOption('X-Plex-Client-Profile-Extra', extras)
      }
    }
  }

  if (logger.length > 0) {
    console.info(logger)
  }

  // reconstruct the parameters that were edited
  rurl.search = sparams.toString()
  request = new Request(rurl, request)
  let response = await fetch(request)

  // return the response
  response = new Response(response.body, response)
  if (changed) {
    response.headers.set("x-plex-blackmagic", "true")
  }
  return response
}

/**
 * Catch the Cloudflare event and process it.
 */
addEventListener('fetch', event => {
  event.passThroughOnException()
  event.respondWith(handleRequest(event.request))
})