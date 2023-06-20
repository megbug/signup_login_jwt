import mongoose, { Post, User } from "../model/index.js";

import data from "./seed_data.json" assert { type: "json" };

await mongoose.connection.dropDatabase();

const authors = data.blogPosts.map((article) => article.author);
const uniqueAuthors = [...new Set(authors)];

const userCreationPromiseArray = uniqueAuthors.map((author) => {
  const mail = author.split(" ").join(".") + "@gmail.com";
  const password = mail;
  const user = new User({ name: author, mail: mail });
  user.setPassword(password.toLowerCase());
  return user.save();
});

await Promise.all(userCreationPromiseArray);

for (let postData of data.blogPosts) {
  // new post
  let post = new Post({ title: postData.title, content: postData.content });
  // find author
  const author = await User.findOne({ name: postData.author });
  // setup post with author
  post.author = author;
  // save Post 
  post = await post.save();
  // add post to User
  author.posts.push(post);
  // save update made to author
  author.save();
}

const noah = await User.findOne({ mail: 'noah.miller@gmail.com' });
console.log(noah);
const loginPassword = '123456789';
//const loginPassword = 'noah.miller@gmail.com';
console.log(typeof noah.setPassword);
console.log(typeof noah.verifyPassword);
const isPasswordValid = noah.verifyPassword(loginPassword);
console.log(isPasswordValid);

//const user = await User.find().populate('posts')
// console.log(user)