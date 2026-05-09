import pytest
from unittest.mock import patch, MagicMock

from main import (
    get_breeds_info,
    find_breed_info,
    display_breed_profile,
    main,
    parse_args,
)


class TestGetBreedsInfo:
    """Tests for get_breeds_info function"""

    @patch("main.requests.get")
    def test_get_breeds_info_success(self, mock_get):
        """Test successful API call"""
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {"name": "Siamese", "origin": "Thailand"},
            {"name": "Persian", "origin": "Iran"},
        ]
        mock_get.return_value = mock_response

        result = get_breeds_info()

        assert len(result) == 2
        assert result[0]["name"] == "Siamese"
        mock_get.assert_called_once_with("https://api.thecatapi.com/v1/breeds")
        mock_response.raise_for_status.assert_called_once()

    @patch("main.requests.get")
    def test_get_breeds_info_api_error(self, mock_get):
        """Test API error handling"""
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = Exception("API Error")
        mock_get.return_value = mock_response

        with pytest.raises(Exception, match="API Error"):
            get_breeds_info()


class TestFindBreedInfo:
    """Tests for find_breed_info function"""

    @patch("main.get_breeds_info")
    def test_find_breed_info_found(self, mock_get_breeds):
        """Test finding an existing breed"""
        mock_get_breeds.return_value = [
            {"name": "Siamese", "origin": "Thailand"},
            {"name": "Persian", "origin": "Iran"},
        ]

        result = find_breed_info("Siamese")

        assert result is not None
        assert result["name"] == "Siamese"
        assert result["origin"] == "Thailand"

    @patch("main.get_breeds_info")
    def test_find_breed_info_not_found(self, mock_get_breeds):
        """Test breed not found"""
        mock_get_breeds.return_value = [
            {"name": "Siamese", "origin": "Thailand"},
        ]

        result = find_breed_info("NonExistent")

        assert result is None

    @patch("main.get_breeds_info")
    def test_find_breed_info_case_sensitive(self, mock_get_breeds):
        """Test that breed search is case-sensitive"""
        mock_get_breeds.return_value = [
            {"name": "Siamese", "origin": "Thailand"},
        ]

        result = find_breed_info("siamese")

        assert result is None


class TestDisplayBreedProfile:
    """Tests for display_breed_profile function"""

    def test_display_breed_profile_with_wikipedia(self, capsys):
        """Test displaying breed profile with Wikipedia URL"""
        breed = {
            "name": "Siamese",
            "origin": "Thailand",
            "temperament": "Active, Playful",
            "life_span": "12 - 15",
            "weight": {"imperial": "8 - 12"},
            "wikipedia_url": "https://en.wikipedia.org/wiki/Siamese_cat",
        }

        display_breed_profile(breed)
        captured = capsys.readouterr()

        assert "Siamese" in captured.out
        assert "Origin: Thailand" in captured.out
        assert "Temperament: Active, Playful" in captured.out
        assert "Life Span: 12 - 15 years" in captured.out
        assert "Weight: 8 - 12 lbs" in captured.out
        assert "Learn more: https://en.wikipedia.org/wiki/Siamese_cat" in captured.out

    def test_display_breed_profile_without_wikipedia(self, capsys):
        """Test displaying breed profile without Wikipedia URL"""
        breed = {
            "name": "Persian",
            "origin": "Iran",
            "temperament": "Calm, Gentle",
            "life_span": "10 - 15",
            "weight": {"imperial": "7 - 12"},
        }

        display_breed_profile(breed)
        captured = capsys.readouterr()

        assert "Persian" in captured.out
        assert "Origin: Iran" in captured.out
        assert "Learn more:" not in captured.out


class TestParseArgs:
    """Tests for parse_args function"""

    def test_parse_args_with_breed(self):
        """Test parsing breed argument"""
        with patch("sys.argv", ["main.py", "Siamese"]):
            args = parse_args()
            assert args.breed == "Siamese"

    def test_parse_args_missing_breed(self):
        """Test missing breed argument"""
        with patch("sys.argv", ["main.py"]):
            with pytest.raises(SystemExit):
                parse_args()


class TestMain:
    """Tests for main function"""

    @patch("main.parse_args")
    @patch("main.find_breed_info")
    @patch("main.display_breed_profile")
    def test_main_success(self, mock_display, mock_find, mock_parse):
        """Test successful main execution"""
        mock_parse.return_value = MagicMock(breed="Siamese")
        mock_find.return_value = {
            "name": "Siamese",
            "origin": "Thailand",
            "temperament": "Active",
            "life_span": "12 - 15",
            "weight": {"imperial": "8 - 12"},
        }

        result = main()

        assert result == 0
        mock_find.assert_called_once_with("Siamese")
        mock_display.assert_called_once()

    @patch("main.parse_args")
    @patch("main.find_breed_info")
    def test_main_breed_not_found(self, mock_find, mock_parse, capsys):
        """Test main with breed not found"""
        mock_parse.return_value = MagicMock(breed="NonExistent")
        mock_find.return_value = None

        result = main()

        assert result == 0
        captured = capsys.readouterr()
        assert "Breed not found" in captured.out

    @patch("main.parse_args")
    @patch("main.find_breed_info")
    def test_main_exception_handling(self, mock_find, mock_parse, capsys):
        """Test main with exception"""
        mock_parse.return_value = MagicMock(breed="Siamese")
        mock_find.side_effect = Exception("API Error")

        result = main()

        assert result == 1
        captured = capsys.readouterr()
        assert "Error:" in captured.out
        assert "API Error" in captured.out
