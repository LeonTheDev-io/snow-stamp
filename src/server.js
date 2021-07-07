import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import nodeHTMLParser from 'node-html-parser'
import express from 'express'
import { config } from 'dotenv'
import { getEmbedTitle } from './embed.js'

config()
const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const indexContent = fs.readFileSync(
	path.resolve(__dirname, '../public', 'index.html')
)

app.get('/', (req, res) => {
	const parsedIndex = nodeHTMLParser.parse(indexContent)
	const headElement = parsedIndex.querySelector('head')
	headElement.insertAdjacentHTML(
		'afterbegin',
		'<script>window.__SNOWSTAMP_DYNAMIC__ = true</script>'
	)
	const embedTitle = getEmbedTitle(req.query)
	if (embedTitle) {
		console.log(`${new Date().toLocaleString()} - ${embedTitle}`)
		const metaTags = headElement.querySelectorAll('meta')
		const metaTitleOG = metaTags.find(
			(node) => node.attributes?.property === 'og:title'
		)
		metaTitleOG.setAttribute('content', embedTitle)
	}
	res.send(parsedIndex.toString())
})

app.use('/', express.static(path.resolve(__dirname, `../public`)))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server started on port ${port}`))
