import { PageSeo } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata.json'
import ListLayout from '@/layouts/ListLayout'
import generateRss from '@/lib/generate-rss'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'
import fs from 'fs'
import path from 'path'

import { postsType } from '@/types/blog'

const root = process.cwd()

export async function getStaticPaths({ locales }: { locales: any }) {
  const tags = await getAllTags('blog')

  console.log('locale', locales)
  console.log('type locale', typeof locales)
  const path = (locale) =>
    Object.keys(tags).map((tag) => ({
      params: {
        tag,
      },
      locale,
    }))
  const paths = locales.map((locale) => path(locale)).flat()

  return {
    paths: paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allPosts = await getAllFilesFrontMatter('blog')
  const filteredPosts = allPosts.filter(
    (post) => post.draft !== true && post.tags.map((t) => kebabCase(t)).includes(params.tag)
  )

  // rss
  const rss = generateRss(filteredPosts, `tags/${params.tag}/index.xml`)
  const rssPath = path.join(root, 'public', 'tags', params.tag)
  fs.mkdirSync(rssPath, { recursive: true })
  fs.writeFileSync(path.join(rssPath, 'index.xml'), rss)

  return { props: { posts: filteredPosts, tag: params.tag } }
}

type TagType = {
  posts: postsType
  tag: string
}

export default function Tag({ posts, tag }: TagType) {
  // Capitalize first letter and convert space to dash
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  return (
    <>
      <PageSeo
        title={`${tag} - ${siteMetadata.title}`}
        description={`${tag} tags - ${siteMetadata.title}`}
        url={`${siteMetadata.siteUrl}/tags/${tag}`}
      />
      <ListLayout posts={posts} title={title} />
    </>
  )
}