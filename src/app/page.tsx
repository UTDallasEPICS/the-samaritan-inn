import { prisma } from '@/lib/prisma';

const Home = async () => {
  const posts = await prisma.post.findMany();

  return (
    <div className="p-4 flex flex-col gap-y-4">
      <h2>This is the wonderful website home page!</h2>

      <ul className="flex flex-col gap-y-2">
        {posts.map((post) => (
          <li key={post.id}>{post.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;