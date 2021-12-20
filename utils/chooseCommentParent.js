const chooseCommentParent = (mediaType) =>{
    switch (mediaType) {
      case 'movie':
        return 'parentMovie'
      case 'tv':
        return 'parentTv'
      case 'season':
        return 'parentSeason';
      case 'episode':
        return 'parentEpisode';
      case 'book':
        return 'parentBook';
      default:
        return null;
    }
}

module.exports = chooseCommentParent