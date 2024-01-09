import { AfterViewInit, Component, OnInit } from '@angular/core';
import Hls from 'hls.js';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-hls-demo',
  templateUrl: './hls-demo.component.html',
  styleUrls: ['./hls-demo.component.css'],
})
export class HlsDemoComponent implements OnInit, AfterViewInit {
  constructor(private cookie: CookieService) {
    cookie.set('COOKIES', getCloudFrontCookies());
  }

  ngOnInit(): void {
    // Your initialization code (e.g., Hls configuration) can be placed here

    // fetch(
    //   'https://d3ui9g3h24xbkc.cloudfront.net/audio/output_segments/segment000.aac',
    //   {
    //     // credentials: 'include',
    //     headers: {
    //       // 'Access-Control-Allow-Origin': '*', // add origin here
    //       // add cookie here
    //       Cookie: getCloudFrontCookies(),
    //     },
    //   }
    // );

    const cloudFrontURL =
      'https://d3ui9g3h24xbkc.cloudfront.net/audio/output_segments/segment001.aac';
    const cookies = {
      'CloudFront-Policy':
        'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kM3VpOWczaDI0eGJrYy5jbG91ZGZyb250Lm5ldC9hdWRpby9vdXRwdXRfc2VnbWVudHMvKi5hYWMiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3MDU0NjU3Mzh9fX1dfQ__',
      'CloudFront-Signature':
        'dI6asgmOgaB9-HUTRb~MEGJqEEqCNfda4nsjXaBYCwOnQW8RwnbOp-G9zw~Ae8kLYgwGw75jzKOPq1G-HyYUuRd3AK~MWsmcSVNO~PKtmEMo3d86SqhursPH~4r1FHgqPpwfxppi8pqLQYimeWkC9MyJBbqK8TPzKFXvrzwmCrdYBPNKUuzb~osnTMgbBFn5uhz8S7brG5t34ipWy~C87qjla9EH~igEsHujh7oS8rHLDVx3yJTNeO8COaVtxIxw1b8k8hmVo1GH4XHUCyD2xHQ~NacEpPAJA0rNqcTysG44ydKmb7afQPfmhTgiglUzxZSrpz7Tq6hoDbAYWIKxOA__',
      'CloudFront-Key-Pair-Id': 'K1HQ3NQ2ETY5OV',
    } as any;
    fetch(cloudFrontURL, {
      method: 'GET',
    })
      .then((response) => {
        // Check if the response has a successful status code
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob(); // Get the audio data as a Blob
      })
      .then((audioBlob) => {
        // Process the audio data as needed
        console.log(audioBlob);
      })
      .catch((error) => {
        // Handle errors during the fetch
        console.error('Error:', error);
      });
  }

  ngAfterViewInit(): void {
    const audio = document.querySelector('#player') as HTMLAudioElement;

    if (Hls.isSupported()) {
      // Fetch audio file
      fetch(AudioDataProvider.audio, {
        method: 'GET',
        // credentials: 'include',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to fetch audio file. Status: ${response.status}`
            );
          }
          return response.text();
        })
        .then((data) => {
          // Create the HLS instance
          const hls = new Hls();
          hls.config.xhrSetup = (xhr: XMLHttpRequest, url: string) => {
            try {
              // Check if it's a key or segment request
              if (url.includes('.m3u8')) {
                // Modify the manifest URL or perform any other necessary modifications
                url = modifyManifestUrl(url);
                xhr.open('GET', url, true);
              } else if (url.includes('.key')) {
                // Modify the key URL or perform any other necessary modifications

                url = modifyKeyUrl(url);

                // Set CloudFront cookies in the headers
                // xhr.setRequestHeader('Cookie', getCloudFrontCookies());

                // set cookie to header

                xhr.open('GET', url, true);
              } else if (url.includes('.aac')) {
                // Modify the segment URL or perform any other necessary modifications
                url = modifySegmentUrl(url);

                // xhr.setRequestHeader(
                //   'CloudFront-Policy',
                //   AudioDataProvider.cloudFrontPolicy
                // );
                // xhr.setRequestHeader(
                //   'CloudFront-Signature',
                //   AudioDataProvider.cloudFrontSignature
                // );
                // xhr.setRequestHeader(
                //   'CloudFront-Key-Pair-Id',
                //   AudioDataProvider.cloudFrontKeyPairId
                // );

                xhr.open('GET', url, true);
                xhr.setRequestHeader('X-Cookie', getCloudFrontCookies());
              }
            } catch (error) {
              console.error('Error modifying URL:', error);
            }
          };

          // Load Hls source after modifying the content
          hls.loadSource(AudioDataProvider.audio);
          hls.attachMedia(audio);
        })
        .catch((error) => {
          console.error('Error fetching audio file:', error);
        });
    }
  }
}

// Function to get CloudFront cookies as a string
function getCloudFrontCookies(): string {
  const cookies = Object.entries({
    'CloudFront-Policy': AudioDataProvider.cloudFrontPolicy,
    'CloudFront-Signature': AudioDataProvider.cloudFrontSignature,
    'CloudFront-Key-Pair-Id': AudioDataProvider.cloudFrontKeyPairId,
  })
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  return cookies;
}

function modifyManifestUrl(url: string): string {
  // Modify the manifest URL as needed
  return url;
}

function modifyKeyUrl(url: string): string {
  url +=
    '?Expires=1704284657&Signature=sbYGU6QqHi1BAnVWONJ1INSbad7LG9Rio8WusTYVMxyNMZKImnf9VxhAd8t8y1RI4XmGGo0zwY0hNfFswR9MfAIh6s3~929kqTllx389~3X-X2pXzuYh-8Zyy4dFkbwf0Ou~-M7dGX-fySZaFUlDup8zR~F2Po4FigC~v1A2SHardxlKf1vE-BlEA9ygJgsn1MSi0tJT1l3JmecfbVtSESS3tifR~Mrvfh3ikBCkfRZXFts0rLW-Re28-GgfGtOGMqyPLCqky5IL5VocGp3Jp69W44qKkoXRnZXSATQlrYmVBmiM-3BsyF027db6WQG2SrISV3QL41n3dCFEGt56Lw__&Key-Pair-Id=K1HQ3NQ2ETY5OV';
  // Modify the key URL as needed
  return url;
}

function modifySegmentUrl(url: string): string {
  // Modify the segment URL as needed
  return url;
}

class AudioDataProvider {
  static segment =
    'https://d3ui9g3h24xbkc.cloudfront.net/audio/output_segments/segment000.aac';
  static audio =
    'https://d3ui9g3h24xbkc.cloudfront.net/audio/sample.m3u8?Expires=1704284657&Signature=cD8DygYZpzVZgGVIhp3ay9iimQQFZfHesH3n~WJwAsNCnvnNnRYz3NPlPDMz7ugEEmH4Bw~5u4OLPtxO5qcrDkO~jNIPIWFkInhvRTj1cGJBD1f1pdShQpwj8aPwoYIeKx5wv441eyvtj-ieDeuH7x3ox0CrAdnq-twHq5TrR2twJz~KCnZzBsjqFsacA6UobVPnDTabxMeV5WHYBMTZ33xxCG9fEighhF2~kn4VGHOp7A4KcUGf3JG2V50B1g3Yl8J1ObaRrsyHCMtOP~PGKD2IN~4saZzfukHl59mNTEBmUwS4LiVv5jTTchplMh2xjWI4SbErdGaX1bt~OVxpig__&Key-Pair-Id=K1HQ3NQ2ETY5OV';
  static key =
    'https://d3ui9g3h24xbkc.cloudfront.net/audio/enc.key?Expires=1704284657&Signature=sbYGU6QqHi1BAnVWONJ1INSbad7LG9Rio8WusTYVMxyNMZKImnf9VxhAd8t8y1RI4XmGGo0zwY0hNfFswR9MfAIh6s3~929kqTllx389~3X-X2pXzuYh-8Zyy4dFkbwf0Ou~-M7dGX-fySZaFUlDup8zR~F2Po4FigC~v1A2SHardxlKf1vE-BlEA9ygJgsn1MSi0tJT1l3JmecfbVtSESS3tifR~Mrvfh3ikBCkfRZXFts0rLW-Re28-GgfGtOGMqyPLCqky5IL5VocGp3Jp69W44qKkoXRnZXSATQlrYmVBmiM-3BsyF027db6WQG2SrISV3QL41n3dCFEGt56Lw__&Key-Pair-Id=K1HQ3NQ2ETY5OV';
  static policy =
    'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kM3VpOWczaDI0eGJrYy5jbG91ZGZyb250Lm5ldC9hdWRpby9vdXRwdXRfc2VnbWVudHMvKi5hYWMiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3MDQyNjQ4NTd9fX1dfQ__';
  static signature =
    'IKDITtcFEEn2g~Zk~1M4Cv-2TBC8PIV8oHBXGBxeME6IfvuXsokp8ipUvTNqpciqILPyEFhpV08GSFq~vsBiwrfO3ZU0SR87VwG5puTHayZ4nau20opC6AX~-8eQKxALTP8conRTPcmKuvYoL6Sl8C5KRkOC3SFz4McVEW7L1otfC92ThGAwf6uNd5Yh7PRB7Rs-AM7KfxDbECvQ~JZ5Oae3G~COkloi6gTy52n2sypo2YfBdzI0jlZwyexxtU4Ojqb1lWFr31MIdAQ66wFi1MMakif1JzqV0862t3oju237D9HIQeLWxPv4TR9avSoq7bNsyh6W3O4DJdftvyCMbQ__';
  static keyPairId = 'K1HQ3NQ2ETY5OV';

  static cloudFrontPolicy =
    'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kM3VpOWczaDI0eGJrYy5jbG91ZGZyb250Lm5ldC9hdWRpby9vdXRwdXRfc2VnbWVudHMvKi5hYWMiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3MDU0NjU3Mzh9fX1dfQ__';
  static cloudFrontSignature =
    'dI6asgmOgaB9-HUTRb~MEGJqEEqCNfda4nsjXaBYCwOnQW8RwnbOp-G9zw~Ae8kLYgwGw75jzKOPq1G-HyYUuRd3AK~MWsmcSVNO~PKtmEMo3d86SqhursPH~4r1FHgqPpwfxppi8pqLQYimeWkC9MyJBbqK8TPzKFXvrzwmCrdYBPNKUuzb~osnTMgbBFn5uhz8S7brG5t34ipWy~C87qjla9EH~igEsHujh7oS8rHLDVx3yJTNeO8COaVtxIxw1b8k8hmVo1GH4XHUCyD2xHQ~NacEpPAJA0rNqcTysG44ydKmb7afQPfmhTgiglUzxZSrpz7Tq6hoDbAYWIKxOA__';
  static cloudFrontKeyPairId = 'K1HQ3NQ2ETY5OV';
}
