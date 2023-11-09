import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(400).json({
			message: 'Just post are allowed',
		});
	}

	if (!req.body) {
		return res.status(400).json({
			message: 'No body found',
		});
	}

	const invalidKey = validObj(req.body, ['email', 'password', 'body', 'title']);

	if (invalidKey) {
		return res.status(400).json({
			message: `The ${invalidKey} was not informed`,
		});
	}

	const { email, password, body, title } = req.body as any;

	const responseSession = await fetch(
		'https://www.tabnews.com.br/api/v1/sessions',
		{
			method: 'post',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
			},
			body: JSON.stringify({
				email,
				password,
			}),
		}
	);

	const dataSession = await responseSession.json();

	const responseArticle = await fetch(
		'https://www.tabnews.com.br/api/v1/contents',
		{
			method: 'post',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Cookie: `section_id=${dataSession.id}; session_id=${dataSession.token}`,
			},
			body: JSON.stringify({
				body,
				title,
				status: 'published',
			}),
		}
	);

	const dataArticle = await responseArticle.json();

	console.log(dataArticle);

	res.status(200).json({
		...dataArticle,
		link: `https://www.tabnews.com.br/${dataArticle.owner_username}/${dataArticle.slug}`,
	});
}

function validObj(obj: object, requiredKeys: string[]): string | null {
	const keys = Object.keys(obj);

	const notFoundKey = requiredKeys.find((k) => !keys.includes(k));

	if (notFoundKey) return notFoundKey;

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];

		if (!(obj as any)[key].length) {
			return key;
		}
	}

	return null;
}
