import {
  useSearchUsersQuery,
  useLazyGetUserReposQuery,
} from "../store/gitHub/gitHub.api";
import { useState, useEffect } from "react";
import { useDebounce } from "../hooks/debounce";
import { RepoCard } from "../components/RepoCard";

export function HomePage() {
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const debounced = useDebounce(search, 800);
  const { isLoading, isError, data } = useSearchUsersQuery(debounced, {
    skip: debounced.length < 3,
    refetchOnFocus: true,
  });
  const [fetchRepos, { isLoading: areReposLoading, data: repos }] =
    useLazyGetUserReposQuery();

  useEffect(() => {
    setDropdown(debounced.length > 3 && data?.length! > 0);
  }, [debounced, data]);

  const handleClick = (username: string) => {
    fetchRepos(username);
    setDropdown(false);
  };

  return (
    <div className="flex flex-col items-center pt-10 mx-auto h-screen w-screen">
      {isError && (
        <p className="text-center text-red-600">Something went wrong...</p>
      )}
      <div className="relative w-[560px]">
        <input
          className="border py-2 px-4 w-full h-[42px] mb-2"
          type="text"
          placeholder="Search for Github username..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {dropdown && (
          <ul className="absolute top-[42px] left-0 right-0 max-h-[200px] shadow-md bg-white overflow-y-scroll">
            {data?.map((user) => {
              return (
                <li
                  className="py-2 px-4 hover:bg-gray-500 hover:text-white cursor-pointer transition-colors"
                  key={user.id}
                  onClick={() => {
                    handleClick(user.login);
                  }}
                >
                  {user.login}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div>
        {areReposLoading && <p className="text-center">Repos are loading...</p>}
        {repos?.map((repo) => (
          <RepoCard repo={repo} key={repo.id} />
        ))}
      </div>
    </div>
  );
}
