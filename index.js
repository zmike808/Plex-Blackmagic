addEventListener('fetch', event => {
  event.passThroughOnException()
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(event_request) {
  // Make the headers mutable by re-constructing the Request.
  let request = new Request(event_request)

  let rurl = new URL(request.url)
  let sparams = new URLSearchParams(rurl.searchParams)
  let pmap = new Map(sparams)
  let pobj = Object.fromEntries(pmap)

  console.group('original query')
  console.info(pobj)
  console.groupEnd()
  let edited = false

  if (sparams.has('autoAdjustQuality')) {
    // sparams.set('autoAdjustQuality', '1')
    console.group('auto_quality')
    console.info('autoAdjustQuality Supported')
    console.groupEnd()
  }
  //maxVideoBitrate
  // let multiplier = 5
  // let replaced_br = 6000;
  //"X-Plex-Product":
  let final_bitrate = ''
  let plex_product = sparams.has('X-Plex-Product')
    ? sparams.get('X-Plex-Product')
    : ''
  let plex_platform = sparams.has('X-Plex-Platform')
    ? sparams.get('X-Plex-Platform')
    : ''
  let plex_device_name = sparams.has('X-Plex-Device-Name')
    ? sparams.get('X-Plex-Device-Name')
    : ''
  let plex_device = sparams.has('X-Plex-Device')
    ? sparams.get('X-Plex-Device')
    : ''

  //X-Plex-Platform
  //X-Plex-Device-Name
  //X-Plex-Device
  let autoquality_supported = [
    'Plex Web',
    'Plex for iOS',
    'Plex for Android',
    'Plex for Apple TV',
  ]
  console.group('client')
  // console.info(`plex product is ${plex_product}`);
  console.info(`X-Plex-Product ${plex_product}`)
  console.info(`X-Plex-Platform: ${plex_platform}`)
  console.info(`X-Plex-Device-Name: ${plex_device_name}`)
  console.info(`X-Plex-Device: ${plex_device}`)
  console.groupEnd()
  if (sparams.has('maxVideoBitrate')) {
    console.group('maxVideoBitrate')
    edited = true
    let br = parseInt(sparams.get('maxVideoBitrate'))
    // if (autoquality_supported.includes(plex_product)) {
    //   if (br < 20000) {
    //     br = 20000
    //   }
    //   console.info(`autoquality supported`)
    //   console.info(`plex product is ${plex_product}`)
    //   console.info(`quality was set to ${br}`)
    // } 
    if (br == 2000) {
      br = br * 4
    } else if (br == 3000) {
      br = br * 3
    } else if (br == 4000) {
      br = br * 2
    }
    // br = br * multiplier
    final_bitrate = br.toString()
    sparams.set('maxVideoBitrate', br.toString())
    console.groupEnd()
  }
  if (sparams.has('videoBitrate')) {
    console.group('videoBitrate')
    edited = true
    console.info(`videoBitrate param?`)

    let br = parseInt(sparams.get('videoBitrate'))
    // br = br * multiplier
    // if (autoquality_supported.includes(plex_product)) {
    //   if (br < 20000) {
    //     br = 20000
    //   }
    //   console.info(`autoquality supported`)
    //   console.info(`plex product is ${plex_product}`)
    //   console.info(`quality was set to ${br}`)
    // } 
    if (br == 2000) {
      br = br * 4
    } else if (br == 3000) {
      br = br * 3
    } else if (br == 4000) {
      br = br * 2
    }
    final_bitrate = br.toString()
    sparams.set('videoBitrate', br.toString())
    console.groupEnd()
  }
  //videoBitrate

  if (sparams.has('addDebugOverlay')) {
    // sparams.set('addDebugOverlay', '0');
  }
  // if (sparams.has('mediaBufferSize')) {
  //   let originalbuffer = parseInt(sparams.get('mediaBufferSize'))
  //   let bufferscalar = 1024
  //   let currentMB = originalbuffer / bufferscalar //convert to MB base
  //   console.group('mediaBufferSize')
  //   console.warn(
  //     `original buffer size ${originalbuffer.toString()}KB / ${currentMB.toString()}MB`,
  //   )

  //   let targetMB = 500
  //   let convertedbuffer = targetMB * bufferscalar
  //   let bigbuffer = 512000 // equivalent to 500MB of buffer
  //   let newbuffer = convertedbuffer
  //   console.warn(
  //     `final buffer size is ${newbuffer.toString()}KB / ${targetMB.toString()}MB`,
  //   )
  //   console.groupEnd()
  //   sparams.set('mediaBufferSize', newbuffer.toString())
  // }

  if (sparams.has('X-Plex-Client-Profile-Extra')) {
    // console.error('finalbitrate=',final_bitrate);
    let extras = sparams.get('X-Plex-Client-Profile-Extra')
    let limits = extras.split('+')
    console.group('limits', "sparams.has('X-Plex-Client-Profile-Extra'")
    console.debug('original profile extras: ', limits)

    const killit =
      'add-limitation(scope=videoCodec&scopeName=*&type=upperBound&name=video.bitrate'
    let filtered = limits.filter(
      target =>
        !(
          target.includes('add-limitation') &&
          target.includes('name=video.bitrate')
        ),
    )
    let newextras = limits
      .filter(
        target =>
          !(
            target.includes('add-limitation') &&
            target.includes('name=video.bitrate')
          ),
      )
      .join('+')

    console.debug('filtered limits: ', filtered)
    console.debug('filtered new extras: ', newextras)

    let regexps = new RegExp(/name=video.bitrate&value=[^&]+/i)
    let killregex = new RegExp(
      /add-limitation\(scope=videoCodec&scopeName=*&type=upperBound&name=video.bitrate\)/i,
    )
    // let reasonable_limitbreak = 20000; //20mbps
    // if(final_bitrate < reasonable_limitbreak)
    let replaced_extras = extras.replace(
      /name=video.bitrate&value=[^&]+/gi,
      `name=video.bitrate&value=${final_bitrate}`,
    )
    console.info(
      'replaced extras: should be used in final params: ',
      replaced_extras.split('+'),
    )
    console.groupEnd()

    console.debug(
      'before setting replaec_extras...\n',
      sparams.get('X-Plex-Client-Profile-Extra').split('+'),
    )
    sparams.set('X-Plex-Client-Profile-Extra', replaced_extras)
    console.debug(
      'after setting replaec_extras...\n',
      sparams.get('X-Plex-Client-Profile-Extra').split('+'),
    )
  }

  let editedparams = Object.fromEntries(new Map(sparams))
  console.group('new query')
  console.info(editedparams)

  if (sparams.has('X-Plex-Client-Profile-Extra')) {
    console.warn(
      'profile extras = ',
      sparams.get('X-Plex-Client-Profile-Extra').split('+'),
    )
  } else {
    console.warn('NO PROFILE EXTRAS FOUND???')
  }

  console.groupEnd()
  pobj = editedparams
  rurl.search = sparams.toString()
  console.info('rurl search =\n', rurl.search)
  console.info('rurl =\n', rurl, rurl.toString(), rurl.toJSON())
  request = new Request(rurl, request)
  // let nurl = new URL(request.url)
  // let logparams = new URLSearchParams(nurl.searchParams)
  // let logmap = new Map(logparams)
  // let logobj = Object.fromEntries(new Map(logparams))
  // let printparams = JSON.stringify(logobj, null)

  // console.debug(`finalized request X-Plex-Token: ${logparams.get('X-Plex-Token')}`)
  // console.debug(`printparams: ${printparams}`)
  // console.debug(hobj, pobj);

  // URL is set up to respond with dummy HTML, remove to send requests to your own origin
  let response = await fetch(request)
  // Make the headers mutable by re-constructing the Response.
  return response
}
