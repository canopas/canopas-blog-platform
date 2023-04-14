import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";
import ServerError from "../components/errors/serverError";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import config from "../config";
import axios from "axios";
import Seo from "./seo";
import { setPostFields, calculateWeight } from "../utils";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper";

export async function getServerSideProps() {
  var response = null;
  var posts = [];
  var categories = [];

  try {
    response = await axios.get(
      config.STRAPI_URL + "/v1/posts?populate=deep&status=published"
    );
    posts = response.data.data;
    posts.forEach((post) => setPostFields(post));
  } catch (err) {
    response = err.response;
  }

  const status = response ? response.status : config.NOT_FOUND;

  // fetch All Categories
  try {
    response = await axios.get(
      config.STRAPI_URL + "/v1/categories?populate=deep"
    );
    categories = response.data.data;
  } catch (err) {
    response = err.response;
  }

  return { props: { posts, status, categories } };
}

export default function Home({ posts, status, categories }) {
  var [results, setResults] = useState(posts);
  const [categoryPosts, setCategoryPosts] = useState(posts);
  const [keyword, setKeyword] = useState("");
  const [activeIndex, setActiveIndex] = useState("");
  const count = results.length;
  const category = "all";

  const filterBlogs = (event) => {
    if (event.target.innerHTML == category) {
      setCategoryPosts(posts);
      setResults(posts);
    } else {
      results = posts.filter(
        (result) =>
          result.attributes.category.data != null &&
          result.attributes.category.data.attributes.name ==
            event.target.innerHTML
      );
      setCategoryPosts(results);
      setResults(results);
    }
  };

  const searchBlogs = (keyword) => {
    const result = categoryPosts
      .map((post) => ({
        post,
        weight: calculateWeight(post, keyword),
      }))
      .filter((result) => result.weight > 0);

    result.sort((a, b) => b.weight - a.weight);

    return result.map((result) => result.post);
  };

  return (
    <>
      <Seo
        title="Canopas Blogs"
        description="Canopas Blogs will help you to become a better software developer. We are sharing knowledge on Web, Backend, iOS, Android, and Flutter development"
        authorName="canopas"
      />
      <section className="container my-16 mx-2 sm:mx-auto">
        <div className="my-16 w-full bg-black-900">
          <div className="flex flex-col space-y-2 py-4 px-14 md:px-28 xl:px-44">
            <div className="w-20 md:w-1/5 ">
              <hr className="border-1 border-[#ff9472]" />
            </div>
            <div className="text-[1.5rem] md:text-[1.60rem] xl:text-[1.67rem] text-white font-semibold leading-tight md:leading-snug text-left tracking-wide">
              On a mission to help you become a better{" "}
              <span className="text-[#ff9472]">Software Engineer</span>. Sharing
              knowlegde on{" "}
              <span className="text-[#ff9472]">
                #android, #iOS, #web, & #programming.
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:justify-between lg:items-center mb-16">
          <div className="lg:basis-8/12 h-10 border-b border-[#e6e6e6]">
            <Swiper
              navigation={true}
              onClick={(swiper) => setActiveIndex(swiper.clickedIndex)}
              modules={[Navigation]}
              breakpoints={{
                0: {
                  slidesPerView: 2,
                },
                576: {
                  slidesPerView: 3,
                },
                1200: {
                  slidesPerView: 5,
                },
              }}
            >
              <SwiperSlide
                onClick={filterBlogs}
                className={`pb-[0.9rem] capitalize ${
                  activeIndex == "0"
                    ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r from-[#f2709c] to-[#ff9472] canopas-gradient-text "
                    : ""
                }`}
              >
                {category}
              </SwiperSlide>

              {categories.map((category, index) => {
                return (
                  <SwiperSlide
                    key={category.id}
                    onClick={filterBlogs}
                    className={`pb-[0.9rem] capitalize ${
                      activeIndex == index + 1
                        ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r from-[#f2709c] to-[#ff9472] canopas-gradient-text "
                        : ""
                    }`}
                  >
                    {category.attributes.name}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          <div className="flex flex-row items-center lg:basis-3/12 w-80 rounded-[10px] !bg-gray-100 pl-3">
            <span>
              <i className="w-16 h-16 rounded-full text-gray-500 cursor-pointer">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="pr-1 text-sm"
                />
              </i>
            </span>
            <input
              className="!border-0 !bg-gray-100"
              placeholder="Search Blogs"
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setResults(searchBlogs(e.target.value));
              }}
            />
          </div>
        </div>

        {count == 0 || status == config.NOT_FOUND ? (
          <div className="mt-20 text-[1.4rem] text-center text-black-900 ">
            {config.POST_NOT_FOUND_MESSAGE}
          </div>
        ) : status != config.SUCCESS ? (
          <ServerError />
        ) : (
          <div
            className={`grid gap-10 md:gap-5 lg:gap-10 md:grid-cols-3 ${
              count % 3 === 1 ? "md:col-span-1" : ""
            }`}
          >
            {results.map((post, i) => {
              post = post.attributes;

              return (
                <div
                  key={i}
                  className={`space-y-5 ${
                    i === 0 && count % 3 === 1
                      ? "md:flex md:space-x-6 md:col-span-3"
                      : ""
                  }`}
                >
                  <div
                    className={`my-4 w-auto h-auto border border-1 border-gray-300 transition-all aspect-auto hover:scale-105 ${
                      i === 0 && count % 3 === 1
                        ? `md:w-3/5 lg:w-2/4 ${
                            post.image.data == null
                              ? "md:h-[14.7rem] lg:h-[16.51rem] xl:h-[19.67rem] 2xl:h-[22.836rem] bg-black-900"
                              : ""
                          }`
                        : `${
                            post.image.data == null
                              ? "md:h-[7.742rem] lg:h-[10.085rem] xl:h-[12.195rem] 2xl:h-[14.304em] bg-black-900"
                              : ""
                          } `
                    }`}
                  >
                    <Link
                      href={"/" + post.slug}
                      aria-label={"Read more about " + post.title}
                    >
                      <Image
                        width={100}
                        height={100}
                        src={post.image_url || ""}
                        alt={post.alternativeText || ""}
                        loading="eager"
                        className={`${
                          post.image.data == null
                            ? "w-[45%] h-4/5 mx-auto my-[5%]"
                            : "w-full h-full"
                        } object-cover`}
                      />
                    </Link>
                  </div>

                  <div
                    className={`flex flex-col flex-[1_0_0%] space-y-2 ${
                      i === 0 && count % 3 === 1 ? "" : "justify-between"
                    }`}
                  >
                    <div
                      className={`text-[1.375rem] font-semibold leading-7 tracking-wide text-[#000000d6] hover:underline underline-offset-4 transition-all hover:scale-[0.96] ${
                        i === 0 && count % 3 === 1
                          ? "md:text-[1.5rem] lg:text-[1.875rem] md:font-bold md:leading-8 lg:leading-10"
                          : "lg:text-[1.5rem] lg:leading-8"
                      }`}
                    >
                      <Link href={"/" + post.slug}>{post.title}</Link>
                    </div>
                    <div className="text-[1.0625rem] md:text-[1.125rem] lg:text-[1.13rem] lg:leading-7 tracking-wide text-gray-500">
                      <Link href={"/" + post.slug}>
                        <p className="line-clamp-3">{post.summary}</p>
                      </Link>
                    </div>
                    <div className="flex flex-row items-center pt-3 text-[0.875rem] lg:text-[1.125rem] text-gray-500">
                      <div className="relative w-[38px] h-[38px]">
                        <Link href={"/" + post.slug}>
                          <Image
                            width={200}
                            height={200}
                            className="absolute h-full w-full rounded-full object-cover inset-0"
                            src={post.authorImage}
                            alt={post.authorAltText}
                          />
                        </Link>
                      </div>
                      <Link href={"/" + post.slug}>
                        <div className="pl-3 text-[0.875rem] md:text-[0.922rem] leading-5 tracking-wide">
                          <span className="text-green-700 capitalize">
                            {post.authorName}
                          </span>

                          <div>
                            <span>{post.published_on}</span>
                            <span className="after:content-['\00B7'] after:mx-1"></span>
                            <span>{post.readingTime} min read</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
