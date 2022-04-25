import {
    ApplicationContext,
    FacemojiAPI,
    FaceTracker,
    ResourceFileSystem,
} from '@0xalter/mocap4face'

const imageElement = document.getElementById('imageSource') as HTMLImageElement
var ws: any = null;

function startTracking() {
    const context = new ApplicationContext(window.location.href)
    const fs = new ResourceFileSystem(context)

    FacemojiAPI.initialize('d4m6spieosp5xevpy4mmb5o3x4rxsdn7miijyz7ulpq7ytcitemnciq', context).then((activated) => {
        if (activated) {
            console.info('API successfully activated')
        } else {
            console.info('API could not be activated')
        }
    })

    // Initialize
    const asyncTracker = FaceTracker.createImageTracker(fs)
        .then((tracker) => {
            ws = new WebSocket("ws://127.0.0.1:5001/bs");
            ws.onopen = function() {
                console.log('Started tracking')
                requestAnimationFrame(track)
            };
            ws.onclose = function() {
                ws = null;
            }

            return tracker
        })
        .logError('Could not start tracking')

    /**
     * Performs face tracking, called every animation frame.
     */
    function track() {
        const tracker = asyncTracker.currentValue
        if (tracker) {
            const tb = (new Date()).getTime();

            // Face tracking
            const lastResult = tracker.track(imageElement)
            if (lastResult) {
                var bs = '{';
                for (const [name, value] of lastResult.blendshapes) {
                    bs += '"' + name + '":' + value.toFixed(2) + ','
                }
                bs = bs.slice(0, -1) + '}';
                ws.send(bs);
            }

            const te = (new Date()).getTime();
            setTimeout(function() {
                requestAnimationFrame(track)
            }, Math.max(0, 30 - (te - tb)))
        }
    }
}

startTracking();
