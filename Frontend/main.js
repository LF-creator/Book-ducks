let userNameInput = document.querySelector("#username");
let passwordInput = document.querySelector("#password");
let loginDiv = document.querySelector("#loginDiv");
let getUsersBtn = document.querySelector("#getUsers");
let registerBtn = document.querySelector("#register");
let registerNewUser = document.querySelector("#registerNewUser");
let registerDiv = document.querySelector("#registerDiv");
let registerUsername = document.querySelector("#registerUsername");
let registerPassword = document.querySelector("#registerPassword");
let registerEmail = document.querySelector("#registerEmail");
let loginBtn = document.querySelector("#login");
let startLoginBtn = document.querySelector("#startLogin");
let startLogoutBtn = document.querySelector("#startLogout");
let welcomeP = document.querySelector("#welcomeUser");

let main = document.querySelector("#displayBooks");
let toRead = document.querySelector("#toRead");
let books = document.querySelector("#books-list");

let ratedBooks = document.querySelector("#ratedBooks");
let ratedTitleBtn = document.querySelector("#ratedTitle");
let ratedAuthorBtn = document.querySelector("#ratedAuthor");
let ratedRatingBtn = document.querySelector("#ratedRating");


let loggedIn = () => {
  if (sessionStorage.getItem("token")) {
    loginDiv.classList.add("hidden");
    registerDiv.classList.add("hidden");
    startLoginBtn.classList.add("hidden");
    // welcomeP.innerText =
    //   "You are logged in as " + sessionStorage.getItem("userName");
  } else {
    loginDiv.classList.add("hidden");
    registerDiv.classList.add("hidden");
    startLogoutBtn.classList.add("hidden");
  }
};
loggedIn();

let login = async () => {
  let response = await axios.post("http://localhost:1338/api/auth/local", {
    identifier: userNameInput.value,
    password: passwordInput.value,
  });
  console.log(response.data);
  let data = response.data;
  sessionStorage.setItem("token", data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  sessionStorage.setItem("userName", response.data.user.username);
  userId = response.data.user.id;
  welcomeP.innerText = "You are logged in as " + data.user.username;
  loginDiv.classList.add("hidden");
  startLogoutBtn.classList.remove("hidden");
  getBooks();
};

let registerUser = async () => {
  let response = await axios.post(
    "http://localhost:1338/api/auth/local/register",
    {
      username: registerUsername.value,
      password: registerPassword.value,
      email: registerEmail.value,
    }
  );
  let data = response.data;
  sessionStorage.setItem("token", data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  sessionStorage.setItem("userName", response.data.user.username);
  welcomeP.innerText = "You are logged in as " + data.user.username;
  loginDiv.classList.add("hidden");
  startLogoutBtn.classList.remove("hidden");
};

let register = () => {
  loginDiv.classList.add("hidden");
  registerDiv.classList.remove("hidden");
};

let logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("loginId");
  sessionStorage.removeItem("userName");
  welcomeP.innerText = "You are logged out";
  loginDiv.classList.remove("hidden");
  startLogoutBtn.classList.add("hidden");
};

registerBtn.addEventListener("click", register);
registerNewUser.addEventListener("click", registerUser);
startLoginBtn.addEventListener("click", () => {
  loginDiv.classList.remove("hidden");
});

// logut
startLogoutBtn.addEventListener("click", () => {
  logout();
  books.innerHTML = "";
  getBooks();
  location.reload();
});

/* Login */
loginBtn.addEventListener("click", () => {
  login();
  books.innerHTML = "";
  startLoginBtn.classList.add("hidden");
  getBooks();
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get data from Strapi

const getBooks = async () => {
  try {
    const response = await axios.get("http://localhost:1338/api/books?populate=deep,3");
    const data = response.data.data;
    
    displayBooks(data);
  } catch (error) {
    console.log(error);
  }
};
  
  getBooks();

  const displayBooks = (books) => {
    // Sort the books by their ID in ascending order
    books.sort((a, b) => a.id - b.id);

    const booksContainer = document.getElementById("books-container");
  
    books.forEach((book) => {
      const bookDiv = createBookDiv(book);
      if (bookDiv) {
        booksContainer.appendChild(bookDiv);
      }
    });
  };

  const getBookCover = async (bookId) => {
    try {
      const response = await axios.get(`http://localhost:1338/api/books/${bookId}/cover`);
      const coverUrl = response.data.data[0].attributes.url;
      return coverUrl;
    } catch (error) {
      console.log(`Error fetching book cover: ${error}`);
      return null;
    }    
  };

  const createBookDiv = (book) => {
    try {
      const bookDiv = document.createElement("div");
      bookDiv.classList.add("book");
      
      const coverUrl = book.attributes.Cover ? book.attributes.Cover.data.attributes.url : null; // get the cover image URL
      
      if (coverUrl) {
        // display the book info and cover image
        bookDiv.innerHTML = `
          <h2>${book.attributes.Title}</h2>
          <p>Author: ${book.attributes.Author}</p>
          <img src="http://localhost:1338${coverUrl}" alt="Book cover">
          <p>Pages: ${book.attributes.Pages}</p>
          <p>Published: ${book.attributes.Published}</p>
          <p>Rating: ${book.attributes.Rating}</p>
          <select id="rating-select-${book.id}">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>  
          <button onclick="addToRates(${book.id})">Add Rate</button>
          </select>
          <br>
          <button onclick="addToFavorite(${book.id})">Add to favorites</button>
          </div>
  `;
        ;
      } else {
        // if there's no image, display the book info as text only
        bookDiv.innerHTML = `
          <h2>${book.attributes.Title}</h2>
          <p>Author: ${book.attributes.Author}</p>
          <p>Image: ${book.attributes.Image}</p>
          <p>Pages: ${book.attributes.Pages}</p>
          <p>Published: ${book.attributes.Published}</p>
          <p>Rating: ${book.attributes.Rating}</p>
          
        `;
      }

      // add event listeners to the star elements to rate the book
      const stars = bookDiv.querySelectorAll(".star");
      stars.forEach((star) => {
        star.addEventListener("click", async () => {
          const rating = parseInt(star.getAttribute("data-rating"));
          const response = await rateBook(book.id, rating);
          if (response) {
            const rateElement = bookDiv.querySelector(`#rate-${book.id}`);
            rateElement.innerText = `Your rating: ${rating}`;
          }
        });
      });
      
      return bookDiv;
    } catch (error) {
      console.log(`Error creating book div: ${error}`);
      return null;
    }
  };


  let getBookRating = async (bookId) => {
    try {
      let response = await axios.get(`http://localhost:1338/api/books/${bookId}`);
      let book = response.data;
      return book.data.attributes.Rate;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  
  
  let toggleButtonAndRating = (button, ratingDiv) => {
    if (sessionStorage.getItem("token")) {
      button.classList.remove("hidden");
      ratingDiv.classList.remove("hidden");
    } else {
      button.classList.add("hidden");
      ratingDiv.classList.add("hidden");
    }
  };
  


  const addToRates = async (bookId) => {
    const ratingSelect = document.getElementById(`rating-select-${bookId}`);
    const rating = ratingSelect.value;
    try {
      const response = await axios.post(
        `http://localhost:1338/rates`,
        {
          book: bookId,
          user: sessionStorage.getItem("userId"),
          rate: rating
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
      // update the book rating on the page
      const bookDiv = document.getElementById(`book-${bookId}`);
      const rateElement = bookDiv.querySelector(`#rate-${bookId}`);
      const newRating = response.data.rate;
      rateElement.innerText = `Rating: ${newRating}`;
    } catch (error) {
      console.log(error);
    }
  };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let bookId = e.target.id.replace("addToFav", "");
let bookToAdd = books.find((book) => book.id === bookId);

if (favoriteBooks && favoriteBooks.length > 0) {
  // add book to favorites
} else {
  // initialize favorites array and add book to it
}

const favorites = []; // array to store all favorite books

const addToFavorite = async (bookId) => {
  try {
    const response = await axios.get(`http://localhost:1338/api/books/${bookId}`);
    const book = response.data;

    // Add book to favorites array
    favorites.push(book);
    
    // Send updated favorites array to server
    await axios.put(
      "http://localhost:1338/api/users/me",
      {
        favoriteBooks: favorites // Update favoriteBooks field for the logged-in user
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
};

let favoritesList = document.querySelector("#favorites-list");


const showFavorites = async () => {
  let list = document.createElement("ul"); // create a new unordered list element
  favoritesList.innerHTML = ""; // clear the old list
  favoritesList.appendChild(list); // append the new list to the favorites container

  favorites.forEach(async (bookId) => {
    try {
      const response = await axios.get(
        `http://localhost:1338/api/books/${bookId}`
      );
      console.log("response", response);
      const book = response.data.data;
      console.log("book", book);
      const bookDiv = createBookDiv(book);
      console.log("bookDiv", bookDiv);
      let li = document.createElement("li"); // create a new list item element
      li.appendChild(bookDiv); // append the book div to the list item
      list.appendChild(li); // append the list item to the new list
    } catch (error) {
      console.log(`Error fetching book ${bookId}: ${error}`);
    }
  });
};
document.addEventListener("DOMContentLoaded", () => {
  showFavorites();
});

let rateBook = async (bookId, rate) => {
  try {
    let response = await axios.post(
      `http://localhost:1338/api/rates`,
      {
        data: {
          rate: rate,
          books: {
            connect: [bookId],
          },
          users: {
            connect: [sessionStorage.getItem("loginId")],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    response = await axios.get(
      `http://localhost:1338/api/rate?filter[books]=${bookId}&populate=books`
    );
    let userRatings = response.data;
    // Skapa en ny array med alla ratings för en bok
    let userRatingsByBook = {};
    userRatings.data.forEach((userRating) => {
      let bookId = userRating.attributes.books.data[0].id;
      if (!userRatingsByBook[bookId]) {
        userRatingsByBook[bookId] = [];
      }
      userRatingsByBook[bookId].push(userRating);
    });
    // Loopa igenom alla böcker
    for (const bookId in userRatingsByBook) {
      let totalRating = 0;

      // Loopa igenom alla användares ratings för en bok
      for (const userRating of userRatingsByBook[bookId]) {
        totalRating += userRating.attributes.rating;
      }
      const avgRating = Math.round(
        totalRating / userRatingsByBook[bookId].length
      );

      await axios.put(
        `http://localhost:1338/api/books/${bookId}`,
        {
          data: {
            rating: avgRating,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};





