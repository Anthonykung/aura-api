/**
* Copyright (c) 2025 Anthony Kung (anth.dev)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     https://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* @file   azureTranslate.ts
* @author Anthony Kung <hi@anth.dev> (anth.dev)
* @date   Created on 03/28/2025 07:39:48 UTC-07:00
*/

type TranslateOptions = {
  text: string
  to?: string[]
}

export async function translateText({
  text,
  to=["fr", "es", "zh-Hant", "ja", "ko"]
}: TranslateOptions): Promise<any> {
  const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0${to.map(lang => `&to=${lang}`).join('')}&profanityAction=Marked`

  console.log('[translateText]', text, to, endpoint)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_AI_KEY as string,
        'Ocp-Apim-Subscription-Region': process.env.AZURE_AI_REGION as string,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify([{ "text": text }])
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Translation failed: ${res.status} ${res.statusText} - ${error}`)
    }

    const result = await res.json()
    return result
  } catch (err) {
    console.error('[translateText error]', err)
    throw err
  }
}
